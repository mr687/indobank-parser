class BCASelector {
  static get LOGIN_PAGE() {
    return {
      url: "https://ibank.klikbca.com/",
      userField: "#txt_user_id",
      passField: "#txt_pswd",
      submitButton: "input[value='LOGIN']",
    }
  }

  /**
   * SELECTOR FOR SETTLEMENT PAGE
   * @date 2023-04-17
   * @returns {Array}
   */
  static get SETTLEMENT_PAGE() {
    return {
      url: "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
      settlementLink: "tr:nth-child(2) a",
      balanceLink: "tr:nth-child(1) > td > font > a",
      accountNOSelector: "#D1",
      startDateField: "select#startDt",
      startMonthField: "#startMt",
      startYearField: "#startYr",
      endDateField: "#endDt",
      endMonthField: "#endMt",
      endYearField: "#endYr",
      submitButton: "table:nth-child(4) > tbody > tr > td > input:nth-child(1)",
      settlementTable: 'table[bordercolor="#ffffff"] tr',
    }
  }

  /**
   * SELECTOR FOR SETTLEMENT TABLE
   * @returns {Array}
   */
  static get PARSING_FIELD() {
    return {
      accountNoField: 'font:contains("Nomor Rekening")',
      nameField: 'font:contains("Nama")',
      periodeField: 'font:contains("Periode")',
      mataUangField: 'font:contains("Mata Uang")',
      transactionsTable: 'table[border="1"]',
      settlementTable: 'table[border="0"][width="70%"]',
    }
  }
  static get PARSING_FIELD_ENG() {
    return {
      accountNoField: 'font:contains("Account Number")',
      nameField: 'font:contains("Name")',
      periodeField: 'font:contains("Period")',
      mataUangField: 'font:contains("Currency")',
      transactionsTable: 'table[border="1"]',
      settlementTable: 'table[border="0"][width="70%"]',
    }
  }
  /**
   * url LOGOUT
   * @returns {String}
   */
  static get LOGOUT_PAGE() {
    return {
      url: "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
    }
  }
}

module.exports = BCASelector
