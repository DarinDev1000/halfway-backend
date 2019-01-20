
'use strict'

class ReturnC {
  static setReturn(data = [], success = true, error = null){

    const out = {
      success: success,
      error: error && error.message ? error.message : error,
      data: data
    };
    return out;
  }

}

module.exports = ReturnC;