$(document).ready(function() {
    spreadsheetOnlyButton.makeButton($('body'));

    var fundCode = $("#add_fund_code").val();
    var moduleKey = $("#module_key").val();
    fundCode = fundCode === 'TEST' ? 'HIST' : fundCode;
    var getFund = fund.getFundInfo({fund_code: fundCode, auth: moduleKey});

    getFund.done(function(data) {
        fund.createChart(data.data, document.getElementById('funds-chart'));
        fund.showFundData(data.data, document.getElementById('fund-data'));
    })
    .fail(reporting.unexpectedError)
    .always(hideSpinner);
});

$('#add_to_spreadsheet').submit(function(e) {
    e.preventDefault();

    var isbnOrUrl = $('#isbn_or_url').val();
    var fundCode = $('#add_fund_code').val();
    var moduleKey = $('#module_key').val();

    reporting.hideMessageContainer();

    var isInvalidEntry = validation.invalidEntry(isbnOrUrl);
    if (isInvalidEntry) {
        reporting.reportErrors({messages: [isInvalidEntry]});
        return false;
    } else if (validation.ISBNLike(isbnOrUrl)) {
        //Strip hyphens just to make it easier on server side
        isbnOrUrl = addItems.stripHyphensFromISBN(isbnOrUrl);
    }

    var addItemsToSheet = addItems.addToSheet({item_data: isbnOrUrl, add_fund_code: fundCode, auth: moduleKey});
    addItemsToSheet.
        then(reporting.checkForSuccessAddItems, reporting.unexpectedError).
        always(hideSpinner);
});

$('#submit_order').submit(function(e) {
    e.preventDefault();

    reporting.hideMessageContainer();
    var fundCode = $('#submit_fund_code').val();
    var moduleKey = $('#module_key').val();

    var submitOrder = orderSubmission.submitOrder({submit_fund_code: fundCode, auth: moduleKey});
    submitOrder.
        then(reporting.checkForSuccessSubmission, reporting.unexpectedError).
        always(hideSpinner);
});
