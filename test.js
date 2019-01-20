const fetch = require('node-fetch');
const htmlparser = require('htmlparser');

async function test() {

  const pagePromise = await fetch('https://www.freecodecamp.org/fcc5ec0c94b-9c7b-4f54-85e4-c11b4d858d4d');
  const pageText = await pagePromise.text();

  const handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error) {
      console.log('err', error);
    } else {
      const rows = dom[1].children[1].children[7].children[7].children[3].children[0].children[0];
      for (const r of rows.children) {
        if (r.name === 'tr') {
          console.log(r.children);
        }
      }
    }
  });
  const parser = new htmlparser.Parser(handler);
  parser.parseComplete(pageText);
}

test();