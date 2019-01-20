"use strict";

// const _ = require('underscore');
const ObjectCompare = require('./ObjectCompare');

class DBCompare {

  static async home(ctx) {
    await ctx.render('index.twig', { message: ctx.params.info });
  }

  static async isEmpty(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
  }

  static async getDatabaseInfo(Databases) {
    // GET DATABASE INFO
    console.log("Running getDatabaseInfo");
    // LOOP THROUGH BOTH DATABASES
    for (const key in Databases) {
      const db = Databases[key];
      try {
        //  const [dbInfo] = await db.connection.query(`select * from sys.databases;`);
        // const [dbInfo] = await db.connection.query(`DESCRIBE anotherTable;`);
        // const [dbInfo] = await db.connection.query(`SHOW CREATE DATABASE :databaseName;`, {databaseName: db.databaseName});
        const [[dbInfo]] = await db.connection.query(/*sql*/`SELECT * FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME=:databaseName;`, { databaseName: db.databaseName });
        // console.log(dbInfo);
        db.dbInfo = dbInfo;

      } catch (error) {
        console.log(`DATABASE_NAME error.  Is object undefined?`);
        const errorObject = { "message": `DATABASE_NAME error. Is object undefined?`, "error": error };
        throw errorObject;
      }
    }
  }

  static async getDatabaseTables(Databases) {
    // GET DATABASE TABLES
    console.log("Running getDatabaseTables");
    for (const key in Databases) {
      const db = Databases[key];
      try {
        // GET TABLES OF COMPARE DB
        const [dbTables] = await db.connection.query(/*sql*/`SELECT * FROM INFORMATION_SCHEMA.TABLES 
                                              WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA=:databaseName;`,
                                              {databaseName: db.databaseName});
        //console.log(dbTables);
        db.tablesObject = dbTables;

      } catch (error) {
        console.log(`error.  Is object undefined?`);
      }
    }
  }

  static async getDatabaseColumns(Databases) {
    //-----------------------------------------------------
    // GET COLUMNS OF EACH TABLE
    //-----------------------------------------------------
    console.log("Running getDatabaseColumns");
    for (const key in Databases) {
      const db = Databases[key];
      console.log(db.tablesObject.length);
      for (let index = 0; index < db.tablesObject.length; index++) {
        try {
          const tableName = db.tablesObject[index].TABLE_NAME;
          // GET COLUMNS OF COMPARE DB
          const [dbColumns] = await db.connection.query(/*sql*/`SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                                                WHERE TABLE_SCHEMA=:databaseName AND TABLE_NAME=:tableName;`,
                                                { databaseName: db.databaseName, tableName: tableName });
          // console.log(dbColumns);
          db.Tables[tableName] = dbColumns;

        } catch (error) {
          console.log(`error.  Is object undefined?`);
        }
      }
    }
  }

  static async getAllTableList(Databases, allTableSet) {
    // Probably don't need this
    console.log("Running getAllTableList");
    // Generate tableList1
    for (const key in Databases) {
      const db = Databases[key];
      for (let index = 0; index < db.tablesObject.length; index++) {
        try {
          // console.log(db1Tables[index]);
          // console.log(db1Tables[index].TABLE_NAME);
          const tableName = db.tablesObject[index].TABLE_NAME;
          db.tableList.push(tableName);
          allTableSet.add(tableName);
        } catch (error) {
          console.log(`TABLE_NAME error for ${db.tablesObject[index].TABLE_NAME}.  Is object undefined?`);
        }
        // if ( (db1Tables[index] && db1Tables[index].TABLE_NAME) === (db2Tables[index] && db2Tables[index].TABLE_NAME) ) {
        //   console.log("same");
        // } else console.log("different");
      }
    }


    // Generate tableList2
    // for (let index = 0; index < Databases.db2.tablesObject.length; index++) {
    //   try {
    //     const tableName = Databases.db2.tablesObject[index].TABLE_NAME
    //     Databases.db2.tableList.push(tableName);
    //     allTableSet.add(tableName);
    //     console.log(tableName);
    //     console.log(allTableSet);
    //   } catch (error) {
    //     console.log("TABLE_NAME error.  Is object undefined?");
    //   }
    // }
    // SORTING IS NOT NECESSARY. THE DATABASE IF ALPHABETICAL BY DEFAULT.
    Databases.db1.tableList.sort();
    Databases.db2.tableList.sort();
    // allTableSet.sort;
    // console.log(Tables.tableList1);
    // console.log(Tables.tableList2);
    console.log(allTableSet);

    // COPY Databases.db1.allTableSet TO DB2
    //Databases.db2.allTableSet = Databases.db1.allTableSet;
  }

  static async compareDatabaseInfo(Databases) {
    console.log("\nCompare Database Info Start");
    // Only list the differences
    const DatabaseDiff = {db1: {}, db2: {}};
    let DatabaseInfoSame = false;

    if (Databases.db1.dbInfo.DEFAULT_CHARACTER_SET_NAME !== Databases.db2.dbInfo.DEFAULT_CHARACTER_SET_NAME) {
      DatabaseDiff.db1.DEFAULT_CHARACTER_SET_NAME = Databases.db1.dbInfo.DEFAULT_CHARACTER_SET_NAME;
      DatabaseDiff.db2.DEFAULT_CHARACTER_SET_NAME = Databases.db2.dbInfo.DEFAULT_CHARACTER_SET_NAME;
    }

    if (Databases.db1.dbInfo.DEFAULT_COLLATION_NAME !== Databases.db2.dbInfo.DEFAULT_COLLATION_NAME) {
      DatabaseDiff.db1.DEFAULT_COLLATION_NAME = Databases.db1.dbInfo.DEFAULT_COLLATION_NAME;
      DatabaseDiff.db2.DEFAULT_COLLATION_NAME = Databases.db2.dbInfo.DEFAULT_COLLATION_NAME;
    }

    if (DBCompare.isEmpty(DatabaseDiff)) {
      // console.log(DatabaseDiff);
      DatabaseInfoSame = true;
      console.log("Database Info is the same");
    } else {
      console.log(DatabaseDiff);
    }
    const returnArray = [DatabaseInfoSame, DatabaseDiff];
    return returnArray;
  }

  // Compare Tables and table properties
  static async compareTables(Databases) {
    console.log("\nCompare Tables Start");
    const undefinedDisplayString = "------";
    // Only list the differences
    const tablePropertiesToCompare = [ "TABLE_NAME",
                                  "TABLE_TYPE",
                                  "ENGINE",
                                  "VERSION",
                                  "ROW_FORMAT",
                                  "TABLE_ROWS",
                                  "TABLE_COLLATION",
                                  "CREATE_OPTIONS",
                                  "TEMPORARY"];
    const TableDiff = {};
    TableDiff.db1 = {};
    TableDiff.db2 = {};
    const sameTableList = [];
    let lastKey = 0;

    // LOOP TABLES IN DB1
    for (const key in Databases.db1.tablesObject) {
      if (Databases.db1.tablesObject.hasOwnProperty(key)) {
        const dbTable_A = Databases.db1.tablesObject[key];
        // console.log(dbTable_A);
        lastKey = key;

        // GET DB1 TABLE NAME
        const tableName = dbTable_A.TABLE_NAME;
        // console.log("tableName", tableName);


        // CHECK IF TABLE IN DB2 and assign to dbTable_B
        let tableInBothDB = false;
        let dbTable_B = {};
        for (const key2 in Databases.db2.tablesObject) {
          if (Databases.db2.tablesObject.hasOwnProperty(key2)) {
            const element = Databases.db2.tablesObject[key2];
            if (tableName === element.TABLE_NAME) {
              tableInBothDB = true;
              dbTable_B = element;
              sameTableList.push(tableName);
              // console.log("sameTableList", sameTableList);
              // console.log(`Table (${tableName}) exist in both databases`);
              break;
            }
          }
        }

        // If table in both databases, check properties
        // console.log(`Starting table properties compare`);
        // console.log(`tableInBothDB: ${tableInBothDB}`);
        if (tableInBothDB === true) {
          TableDiff.db1[key] = {};
          TableDiff.db2[key] = {};
          TableDiff.db1[key].TABLE_NAME = tableName;
          TableDiff.db2[key].TABLE_NAME = dbTable_B.TABLE_NAME;
          TableDiff.db1[key].sameTableName = true;
          TableDiff.db2[key].sameTableName = true;
          TableDiff.db1[key].tableProperties = {};
          TableDiff.db2[key].tableProperties = {};
          TableDiff.db1[key].columns = {};
          TableDiff.db2[key].columns = {};
          // Loop through table properties
          for (const property of tablePropertiesToCompare) {
            // console.log(`Comparing (${property}) property`);

            // console.log(dbTable_A[property]);
            // console.log(dbTable_B[property]);
            // Add property to object if they are different
            if (dbTable_A[property] !== dbTable_B[property]) {
              // console.log(`(${dbTable_A[property]}) is not the same`);
              
              // TableDiff.db1[key][tableName] = {};
              // TableDiff.db2[key][dbTable_B.TABLE_NAME] = {};
              TableDiff.db1[key].tableProperties[property] = dbTable_A[property];
              TableDiff.db2[key].tableProperties[property] = dbTable_B[property];
            }
          }

          const ColumnDiff = await DBCompare.compareColumns(Databases, key, tableName, undefinedDisplayString);
          // Databases.ColumnDiff = ColumnDiff;
          TableDiff.db1[key].columns = ColumnDiff[0];
          TableDiff.db2[key].columns = ColumnDiff[1];


        } else {  // TABLE IS NOT IN DB2
          // console.log(`Table (${tableName} does NOT exist in db2)`);
          TableDiff.db1[key] = {};
          TableDiff.db2[key] = {};
          TableDiff.db1[key].TABLE_NAME = tableName;
          TableDiff.db2[key].TABLE_NAME = undefinedDisplayString;
          TableDiff.db1[key].sameTableName = false;
          TableDiff.db2[key].sameTableName = false;
          // TableDiff.db1[key][tableName] = {};
          // TableDiff.db2[key][dbTable_B.TABLE_NAME] = {};

        }
      }
    } // end LOOP TABLES IN DB1


    // LOOP TABLES IN DB2 - Add extra tables
    console.log("\nAdd extra tables in db2 to list START");
    console.log("sameTableList", sameTableList);
    for (const key in Databases.db2.tablesObject) {
      if (Databases.db2.tablesObject.hasOwnProperty(key)) {
        const dbTable_B = Databases.db2.tablesObject[key];
        // console.log(dbTable_B);

        // GET DB2 TABLE NAME
        const tableName_2 = dbTable_B.TABLE_NAME;
        // console.log("tableName_2", tableName_2);

        // Check if table is in DB1 
        let tableInBothDB = false;
        for (const tableAName of sameTableList) {
          // console.log("tableAName", tableAName);
          if (tableAName === tableName_2) {
            tableInBothDB = true;
            // console.log("Table already listed. Check next");
            break;
          }
        }
        // If table is only in db2, add to list
        if (tableInBothDB === false) {
          // TABLE IS NOT IN DB1
          // console.log(`Table (${tableName_2} does NOT exist in db1)`);
          // console.log("Table is not found. Add to TableDiff object");
          lastKey++;
          TableDiff.db1[lastKey] = {};
          TableDiff.db2[lastKey] = {};
          TableDiff.db1[lastKey].TABLE_NAME = undefinedDisplayString;
          TableDiff.db2[lastKey].TABLE_NAME = tableName_2;
          TableDiff.db1[lastKey].sameTableName = false;
          TableDiff.db2[lastKey].sameTableName = false;
        //   TableDiff.db1[lastKey].undefined = {};
        //   TableDiff.db2[lastKey][tableName_2] = {};
        }
        
      }
    } // end LOOP TABLES IN DB2

    return TableDiff;
  }

  static async compareColumns(Databases, key, tableName, undefinedDisplayString) {
    console.log("\n\n----Compare Columns Start----");
    // Only list the differences
    const columnPropertiesToCompare = [ "TABLE_NAME",
                                    "COLUMN_NAME",
                                    "COLUMN_DEFAULT",
                                    "IS_NULLABLE",
                                    "DATA_TYPE",
                                    /* // include? 
                                    "CHARACTER_MAXIMUM_LENGTH",
                                    "CHARACTER_OCTET_LENGTH",
                                    "NUMERIC_PRECISION",
                                    "NUMERIC_SCALE",
                                    "DATETIME_PRECISION",
                                    // ----? */
                                    "CHARACTER_SET_NAME",
                                    "COLLATION_NAME",
                                    "COLUMN_TYPE",
                                    "COLUMN_KEY",
                                    "EXTRA",
                                    "PRIVILEGES",
                                    "COLUMN_COMMENT"];
    
    const ColumnDiff1 = {};
    const ColumnDiff2 = {};
    const ColumnDiff = [ColumnDiff1, ColumnDiff2];
    const db1AllTables = Databases.db1.Tables;
    const db2AllTables = Databases.db2.Tables;
    const db1TableList = Object.keys(db1AllTables);
    const db2TableList = Object.keys(db2AllTables);
    // const table1DiffLocation = Databases.DBDiff.TableDiff.db1[key].columns;
    // const table2DiffLocation = Databases.DBDiff.TableDiff.db1[key].columns;
    let db1TableColumns = [];
    let db2TableColumns = [];
    let lastColumnKey = 0;
    let sameColumnList = [];

    db1TableColumns = db1AllTables[tableName];
    db2TableColumns = db2AllTables[tableName];
    // console.log(tableName, column1);
    

    console.log("Table: ", tableName);


    // LOOP COLUMNS IN table1
    for (const columnKey1 in db1TableColumns) {
      if (db1TableColumns.hasOwnProperty(columnKey1)) {
        const column_X = db1TableColumns[columnKey1];
        // console.log(`column_X: `, column_X);
        lastColumnKey = columnKey1;

        // GET table1 COLUMN NAME
        const columnName1 = column_X.COLUMN_NAME;
        console.log("\ncolumnName1", columnName1);
        let columnName2 = "";

        // CHECK IF column IN table2
        let columnInBothDB = false;
        let column_Y = {};
        for (const columnKey2 in db2TableColumns) {
          if (db2TableColumns.hasOwnProperty(columnKey2)) {
            const element = db2TableColumns[columnKey2];

            console.log(`Checking column:  ${element.COLUMN_NAME}`);
            
            if (columnName1 === element.COLUMN_NAME) {
              columnInBothDB = true;
              column_Y = element;
              console.log(`columnInBothDB ${columnInBothDB}`);
              columnName2 = column_Y.COLUMN_NAME;
              console.log(`columnName2 ${columnName2}`);
              sameColumnList.push(columnName1);
              console.log("sameColumnList", sameColumnList);
              // console.log(`Table (${columnName2}) exist in both databases`);
              break;
            }
          }
        }


        // If column in both tables, check properties
        console.log(`Starting column properties compare`);
        console.log(`columnInBothDB: ${columnInBothDB}`);
        if (columnInBothDB === true) {
          ColumnDiff1[columnKey1] = {};
          ColumnDiff2[columnKey1] = {};
          ColumnDiff1[columnKey1].COLUMN_NAME = columnName1;
          ColumnDiff2[columnKey1].COLUMN_NAME = columnName2;
          ColumnDiff1[columnKey1].sameColumnName = true;
          ColumnDiff2[columnKey1].sameColumnName = true;
          ColumnDiff1[columnKey1].columnProperties = {};
          ColumnDiff2[columnKey1].columnProperties = {};
          // Loop through column properties
          for (const columnProperty of columnPropertiesToCompare) {
            console.log(`Comparing (${columnProperty}) columnProperty`);

            console.log(column_X[columnProperty]);
            console.log(column_Y[columnProperty]);
            // Add columnProperty to object if they are different
            if (column_X[columnProperty] !== column_Y[columnProperty]) {
              console.log(`(${column_X[columnProperty]}) is not the same`);
              
              ColumnDiff1[columnKey1].columnProperties[columnProperty] = column_X[columnProperty];
              ColumnDiff2[columnKey1].columnProperties[columnProperty] = column_Y[columnProperty];
            }
          }

        } else {  // TABLE IS NOT IN DB2

          console.log(`Column (${columnName1} does NOT exist in table2)`);
          ColumnDiff1[columnKey1] = {};
          ColumnDiff2[columnKey1] = {};
          ColumnDiff1[columnKey1].COLUMN_NAME = columnName1;
          ColumnDiff2[columnKey1].COLUMN_NAME = undefinedDisplayString;
          ColumnDiff1[columnKey1].sameColumnName = false;
          ColumnDiff2[columnKey1].sameColumnName = false;

        }
      }
    } // LOOP COLUMNS IN table1

    // LOOP Columns in tabl2 - Add extra columns
    console.log("\nAdd extra columns in table2 to list - START");
    console.log("sameColumnList", sameColumnList);
    for (const key2 in db2TableColumns) {
      if (db2TableColumns.hasOwnProperty(key2)) {
        const element = db2TableColumns[key2];
        // console.log(dbTable_B);

        // GET DB2 TABLE NAME
        const columnName_2 = element.COLUMN_NAME;
        // console.log("tableName_2", tableName_2);

        // Check if table is in DB1 
        let columnInBothDB = false;
        for (const column1Name of sameColumnList) {
          console.log("column1Name", column1Name);
          if (column1Name === columnName_2) {
            columnInBothDB = true;
            console.log("Table already listed. Check next");
            break;
          }
        }
        // If table is only in db2, add to list
        if (columnInBothDB === false) {
          // TABLE IS NOT IN DB1
          // console.log(`Table (${tableName_2} does NOT exist in db1)`);
          // console.log("Table is not found. Add to TableDiff object");
          lastColumnKey++;
          ColumnDiff1[lastColumnKey] = {};
          ColumnDiff2[lastColumnKey] = {};
          ColumnDiff1[lastColumnKey].COLUMN_NAME = undefinedDisplayString;
          ColumnDiff2[lastColumnKey].COLUMN_NAME = columnName_2;
          ColumnDiff1[lastColumnKey].sameColumnName = false;
          ColumnDiff2[lastColumnKey].sameColumnName = false;
        //   TableDiff.db1[lastKey].undefined = {};
        //   TableDiff.db2[lastKey][tableName_2] = {};
        }
        
      }
    } // end loop columns in table2
    return ColumnDiff;
  }

  static async compareDatabasesAPI(ctx) {
    try {
      const Databases = await DBCompare.compareDatabasesStart(ctx);
      // ctx.body = Databases.DBDiff;
      ctx.body = Databases;
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }

  static async compareDatabasesWebpage(ctx) {
    try {
      const Databases = await DBCompare.compareDatabasesStart(ctx);
      const DBDiff = Databases.DBDiff;
      await ctx.render('dbcompare.twig', {Databases: Databases, DBDiff: DBDiff});
      // console.log(DBDiff);
    } catch (error) {
      console.log("ERROR: ", error);
      throw error;
    }
  }

  static async compareDatabasesStart(ctx) {
    try {
      // -----------------------------------------------------
      // Get Info in Databases
      // -----------------------------------------------------
      console.log(`\nStarting----------------------------------------------\n`);
      console.log("Compare Tables in Databases");

      // ONE WAY TO MAKE OBJECTS
      // MAKE Databases OBJECT
      const Databases = {};
      Databases.db1 = {};
      Databases.db2 = {};
      Databases.db1.databaseName = process.env.DB_COMPARE_1_DATABASE;
      Databases.db2.databaseName = process.env.DB_COMPARE_2_DATABASE;
      Databases.db1.connection = global.comparedb1;
      Databases.db2.connection = global.comparedb2;
      Databases.db1.dbInfo = {};
      Databases.db2.dbInfo = {};
      Databases.db1.tableList = [];
      Databases.db2.tableList = [];
      Databases.db1.tablesObject = ["db1Tables"];
      Databases.db2.tablesObject = ["db2Tables"];
      // Databases.db1.allTableSet = new Set([]);
      // Databases.db2.allTableSet = new Set([]);
      Databases.db1.Tables = {};
      Databases.db2.Tables = {};

      const DBDiff = {};

      const allTableSet = new Set();


      /* // moved to Databases object
      // ANOTHER WAY TO MAKE OBJECTS
      // MAKE Tables OBJECT
      var Tables = {
        tableList1: [],
        tableList2: [],
        allTableSet: new Set([])
      };
      */

      // GET DATABASE INFO
      await DBCompare.getDatabaseInfo(Databases);
      
      // GET TABLE LIST FROM THE DATABASE
      await DBCompare.getDatabaseTables(Databases);
      await DBCompare.getAllTableList(Databases, allTableSet);

      // SET TABLE OBJECTS
      for (const t of Databases.db1.tableList) Databases.db1.Tables[t] = {};
      for (const t of Databases.db2.tableList) Databases.db2.Tables[t] = {};

      // GET TABLE COLUMNS
      await DBCompare.getDatabaseColumns(Databases);

      // TRUE/FALSE : ARE THE TABLES THE SAME TODO: using this?
      const tablesSame = await ObjectCompare.isEqual(Databases.db1.tableList, Databases.db2.tableList1) ? true : false;
      console.log(`Are the tables the same: ${tablesSame}`);
      // console.log({tablesSame});

      // OUTPUT THE TABLES TO HTML
      // if (tablesSame) await ctx.render('dbcompare.twig', {tableSame: true, color: 'green', result1: Databases.db1Tables, result2: Databases.db2Tables, tablesSameResult: "Yes, The databases have the same tables."});
      // else await ctx.render('dbcompare.twig', {tableSame: false, color: 'red', result1: Databases.db1Tables, result2: Databases.db2Tables, tablesSameResult: "NO, The databases have different tables."});



      // -----------------------------------------------------
      // Compare Databases
      // -----------------------------------------------------

      const returnArrayDatabaseInfoDiff = await DBCompare.compareDatabaseInfo(Databases);
      DBDiff.DatabaseInfoSame = returnArrayDatabaseInfoDiff[0];
      DBDiff.DatabaseInfoDiff = returnArrayDatabaseInfoDiff[1];
      // -----------------------------------------------------
      // Compare Tables
      // -----------------------------------------------------

      DBDiff.TableDiff = await DBCompare.compareTables(Databases);



      // VIEW JSON OUTPUT ***** comment out *****
      // console.log(Databases);
      delete Databases.db1.connection;
      delete Databases.db2.connection;
      
      // ctx.body = TableDiff;
      Databases.DBDiff = DBDiff;
      // ctx.body = Databases;

      // return DBDiff;
      return Databases;

      /*
      // ------ USING isEqual library -------
      // Object evaluation does not work intuitively like other expressions.
      // Uses underscore library to compare objects
      // Alternative version to converting to string
      console.log(_.isEqual(Databases.db1Tables, Databases.db2Tables));
      if ( _.isEqual(Databases.db1Tables, Databases.db2Tables) ){
        console.log("Tables are same");
        await ctx.render('dbcompare.twig', {tableSame: true, color: 'green', result1: Databases.db1Tables, result2: Databases.db2Tables, tablesSameResult: "Yes, The databases have the same tables."});
      } else {
        console.log("Tables are NOT the same");
        await ctx.render('dbcompare.twig', {tableSame: false, color: 'red', result1: Databases.db1Tables, result2: Databases.db2Tables, tablesSameResult: "NO, The databases have different tables."});
      }
      */
      
      

      //-----------------------------------------------------
      // Compare columns in tables
      //-----------------------------------------------------
      //console.log("\n","Compare columns in tables");









      // // Converts object to string to compare equality.
      // for (let index = 0; index < Databases.db1.tablesObject.length; index++) {
      //   try {
      //     //console.log(db1Tables[index]);
      //     console.log(Databases.db1Tables[index].TABLE_NAME);
      //     //console.log(db2Tables[index]);
      //     console.log(Databases.db2Tables[index].TABLE_NAME);
      //   } catch (error) {
      //     console.log("TABLE_NAME error.  Is object undefined?");
      //   }
        
      //   if ( (Databases.db1Tables[index] && Databases.db1Tables[index].TABLE_NAME) === (Databases.db2Tables[index] && Databases.db2Tables[index].TABLE_NAME) ) {
      //     console.log("same");

      //     //-----------------------------------------------------
      //     // GET COLUMNS OF EACH TABLE
      //     //-----------------------------------------------------

      //     // GET COLUMNS OF COMPARE DB 1
      //     if (Databases.db1Tables[index]) {
      //       //const databaseName1 = process.env.DB_COMPARE_1_DATABASE;  // already done
      //       const tableName1 = Databases.db1Tables[index].TABLE_NAME;
      //       var [db1TableColumns] = await global.comparedb1.query(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName1 AND TABLE_SCHEMA=:databaseName1;`,
      //                                                 {tableName1: tableName1, databaseName1: Databases.db1.databaseName});
      //       //console.log(db1TableColumns);
      //     }

      //     // GET COLUMNS OF COMPARE DB 2
      //     if (Databases.db2Tables[index]) {
      //       //const databaseName2 = process.env.DB_COMPARE_2_DATABASE;  // already done
      //       const tableName2 = Databases.db2Tables[index].TABLE_NAME;
      //       var [db2TableColumns] = await global.comparedb2.query(`SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName2 AND TABLE_SCHEMA=:databaseName2;`,
      //                                                 {tableName2: tableName2, databaseName2: Databases.db2.databaseName});
      //       //console.log(db2TableColumns);
      //     }

      //     if ( _.isEqual(db1TableColumns, db2TableColumns) ){
      //       console.log("Columns are same");
      //     } else {
      //       console.log("Columns are NOT the same");
      //     }
          
      //     // for (let col = 0; col < db1TableColumns.length; col++) {
      //     //   console.log(db1TableColumns[col]);
      //     // }

      //   } else 
      //   console.log("different");
      
      // }






      
      //ctx.body = results;  // return the result as the body
      // await ctx.render('dbcompare.twig', {results: results});
      // console.log(results);
    } catch (e) {
      console.log(e);
      throw e;
    }
  } // end compareDatabasesStart


}

module.exports = DBCompare;
