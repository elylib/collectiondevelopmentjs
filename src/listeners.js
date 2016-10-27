$(document).ready(function() {
    spreadsheetOnlyButton.makeButton($('body'));

    var getFund = fund.getFundInfo($('#add_fund_code').val());

    getFund.done(function(data) {
        fund.createChart(data, document.getElementById('funds-chart'));
        fund.showFundData(data, document.getElementById('fund-data'));
        fund.showGoals(data, document.getElementById('goals'));
    })
    .fail(reporting.unexpectedError)
    .always(hideSpinner);
});

$('#add_to_spreadsheet').submit(function(e) {
    e.preventDefault();

    var theField = $('#isbn_or_url');
    var fieldVal = theField.val();

    reporting.hideMessageContainer();

    var isInvalidEntry = validation.invalidEntry(fieldVal);
    if (isInvalidEntry) {
        reporting.reportErrors({messages: [isInvalidEntry]});
        return false;
    } else if (validation.ISBNLike(fieldVal)) {
        //Strip hyphens just to make it easier on server side
        theField.val(addItems.stripHyphensFromISBN(fieldVal));
    }

    var addItemsToSheet = addItems.addToSheet($(this));
    addItemsToSheet.
        then(reporting.checkForSuccess, reporting.unexpectedError).
        always(hideSpinner);
});

$('#submit_order').submit(function(e) {
    e.preventDefault();

    reporting.hideMessageContainer();

    var submitOrder = orderSubmission.submitOrder($(this));
    submitOrder.
        then(reporting.checkForSuccess, reporting.unexpectedError).
        always(hideSpinner);
});
