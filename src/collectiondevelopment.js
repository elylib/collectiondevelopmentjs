var showSpinner = function() {
    $('.spinner').removeClass('hidden');
};

var hideSpinner = function() {
    $('.spinner').addClass('hidden');
};

var validation = (function() {

    var messages = {
        emptyField: '<p class="error-message">Please enter a valid URL or ISBN #</p>',
        notAnISBN: '<p class="error-message">That is not a valid ISBN. Please check for accuracy.</p>',
        notRecognizedProvider: '<p class="error-message">The url entered is not from a recognized provider. Please check the instructions on the main page.</p>',
	amazonSearch: '<p class="error-message">The URL you are attempting to use is for a search results page. Please use the URL from the item details page.</p>'
    };

    var empty = function(field) {
        /**
        * @param {string} field  Input from the form field
        * @return {boolean} Whether the field is empty
        */
        return field.length < 1;
    };

    var notFromAmazon = function(field) {
        /**
        * Check for markers of an Amazon address and return True if they're not there
        * Doing it this way makes call later cleaner by not having to negate it in the call
        * i.e. prefer notFromAmazon() to !fromAmazon().
        *
        * @param {string} field  Input from the form field
        * @return {boolean} Whether the input is an Amazon address
        */
        return field.indexOf('amazon.com') === -1 && field.indexOf('amzn.com') === -1;
    };

    var isAnAmazonSearch = function(field) {
	/**
	* People sometimes, when a search only has a single result, lose track and
        * want to use the search URL. We might as well catch this specific problem rather
        * than trip to the server.
        *
        * @param {string} field  Input from the form field
        * @return {boolean}  False if not a search results page, true if it is   
	*/
	return field.indexOf('amazon.com/s/ref') !== -1;
    };

    var isAnISBN = function(field) {
        /**
        * Validate whether an input is actually a valid ISBN. May be overkill since we pull all dashes out anyway.
        * 
        * @param {string} field  Input from the form field
        * @return {boolean} Whether the input is formatted as an ISBN
        */
        var regex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89]-?[0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;
        return regex.test(field);
    };

    var ISBNLike = function(field) {
        /**
        * Sorry for the weird negation; heuristic for whether we should treat an input like ISBN.
        * Naive heuristic - if it doesn't have any letters other than x, treat it like an ISBN.
        * Always combine with isAnISBN to validate it's a legitimate input (i.e. don't accept 'X' alone)
        *
        * @param {string} field  Input from the form field
        * @return {boolean} Whether the input should be treated like an ISBN
        */
        return !/[a-wyz]/i.test(field);
    };

    var invalidEntry = function(field) {
        /**
        * Put validation tests together.
        * @param {string} field  Input from the form field
        * @return {boolean or string} Return false if the input is valid (not invalid, weird, sorry)
        *     Return error string detailing why if an input is invalid
        */
        var invalid = false;
        if (empty(field)) {
            invalid = messages.emptyField;
        } else if (ISBNLike(field)) {
            if (!isAnISBN(field)) {
                invalid = messages.notAnISBN;
            }
        } else if (notFromAmazon(field)) {
            invalid = messages.notRecognizedProvider;
        } else if (isAnAmazonSearch(field)) {
	    invalid = messages.amazonSearch;
	}
        return invalid;
    };

    return {messages: messages,
            notFromAmazon: notFromAmazon,
            empty: empty,
            isAnISBN: isAnISBN,
            invalidEntry: invalidEntry,
            ISBNLike: ISBNLike,
	    isAnAmazonSearch: isAnAmazonSearch};
})();

var reporting = (function() {
    var messageContainer = $('#message-container');

    var successSubmission = '<p class="success-message">You request has been submitted. You will receive an email in a few minutes indicating the process is complete.</p>';

    var successAddItems = '<p class="success-message">Your item(s) have been added.</p>';
    

    var reportErrors = function(data) {
        //Put errors on the page
        var errorMessages = buildErrorMessage(data);
        messageContainer.html(errorMessages);
        showMessageContainer();
    };

    var buildErrorMessage = function(data) {
        //Take message from server and display any errors
        var errorMessages = '';
        $.each(data.messages, function(index, value) {
            errorMessages += '<p class="error-message">'+
                             value+
                             '</p>';
        });
        return errorMessages;
    };

    var reportSuccess = function(msg) {
        messageContainer.html(msg);
        showMessageContainer();
    };

    var unexpectedError = function() {
        // When server returns a 500
        var message = '<p class="error-message">An unexpected error has occurred, '+
                      'Ian has been notified. Please email '+
                      'imatzen@westfield.ma.edu with information '+
                      'about what you were trying to do including ' +
                      'any URLs you were trying to import.</p>';
        messageContainer.html(message);
        showMessageContainer();

    };

    var showMessageContainer = function() {
        messageContainer.removeClass('hidden');
    };

    var hideMessageContainer = function() {
        messageContainer.addClass('hidden');
    };

    var checkForSuccessSubmission = function(data) {
        /**
        * Not all errors are treated as server errors, so we need to check a success value
        * 
        * @params {object} data Data returned from the server, must have 'success' and 'messages' elements
        */
        if (data.success) {
            reportSuccess(successSubmission);
        } else {
            reportErrors(data);
        }
    };

    var checkForSuccessAddItems = function(data) {
	if (data.success) {
	    reportSuccess(successAddItems);
	} else {
	    reportErrors(data);
	}
    };
    
    return {checkForSuccessSubmission: checkForSuccessSubmission,
	    checkForSuccessAddItems: checkForSuccessAddItems,
            unexpectedError: unexpectedError,
            showMessageContainer: showMessageContainer,
            hideMessageContainer: hideMessageContainer,
            messageContainer: messageContainer,
            reportErrors: reportErrors,
            buildErrorMessage: buildErrorMessage};
})();



var fund = (function () {

    var colorMap = {
        allocated: '#000',
        expended: '#AF5F0B',
        encumbered: '#0B556D',
        remaining: '#088328'
    };
    var chartType = 'pie';
    var displayOrder = ['remaining', 'expended', 'encumbered'];


    var getFundInfo = function(fundData) {
        return $.ajax({
            url: 'https://collectiondevelopment.herokuapp.com/get_fund',
            method: 'POST',
	    contentType: 'application/json',
            crossDomain: true,
            data: JSON.stringify(fundData)
        });
    };

    var makeLabels = function(fundData) {
        /**
        * Make string of elements for fund labels, i.e. allocated, expended, etc.
        * 
        */
        var fundLabels = '<ul class="fund-labels">'+
                         '<li>'+labelElement('allocated', fundData)+'</li>';
        $.each(displayOrder, function(index, partOfFund) {
            fundLabels += '<li>'+
                          labelElement(partOfFund, fundData)+
                          labelPercent(partOfFund, fundData)+
                          '</li>';
        }); 
        fundLabels += '</ul>';
        return fundLabels;
    };

    var labelElement = function(fundPart, fundData) {
        // Build like this to keep colors centralized and programmatically accessible
        return '<strong style="color:'+colorMap[fundPart]+';">'+
               capitalize(fundPart)+'</strong>: '+
               fundData[fundPart];
    };

    var labelPercent = function(fundPart, fundData) {
        return ' - &#37 '+ percentage(fundData.allocated, fundData[fundPart]);
    };

    var capitalize = function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    var percentage = function(total, portion) {
        var percent = portion / total * 100;
        return percent.toFixed(0);
    };

    var dataForChart = function(fundData) {
        // Give the formatted data to build a chart
        return {
            labels:[],
            datasets: [{
                data: [fundData.remaining, fundData.encumbered, fundData.expended],
                backgroundColor: [
                    colorMap.remaining,
                    colorMap.encumbered,
                    colorMap.expended
                ]
            }]
        };
    };

    var createChart = function(fundData, chartArea) {
        return new Chart(chartArea, {
            type: chartType,
            animation: {
                animateRotate: false
            },
            data: dataForChart(fundData),
            options: {
                legend: {
                    display: false
                }
            }
        });
    };

    var showFundData = function(fundData, fundInfo) {
        fundInfo.innerHTML = makeLabels(fundData);
    };

    return {
        createChart: createChart,
        showFundData: showFundData,
        getFundInfo: getFundInfo,
        makeLabels: makeLabels
    };
})();

var orderSubmission = (function() {
    var submitOrder = function(submitForm) {
        return $.ajax({
            url: 'https://collectiondevelopment.herokuapp.com/submit_order',
	    contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify(submitForm),
            beforeSend: function() {
                showSpinner();
            }
        });
    };

    return {submitOrder: submitOrder};
})();

var addItems = (function() {

    var addToSheet = function(addForm) {
        return $.ajax({
            url: 'https://collectiondevelopment.herokuapp.com/add_to_spreadsheet',
	    contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify(addForm),
            beforeSend: function() {
                showSpinner();
            }
        });
    };

    var stripHyphensFromISBN = function(isbn) {
        return isbn.replace(/-/g, '');
    };

    return {addToSheet: addToSheet,
            stripHyphensFromISBN: stripHyphensFromISBN};
})();

var spreadsheetOnlyButton = (function() {

    var spreadhseetLocation = function() {
        var iframeSrc;
        $('iframe').each(function(index, value) {
            var src = $(value).attr('src');
            if (src) {
                if (src.indexOf('docs.google') !== -1) {
                    iframeSrc = src;
                }
            }
        });
        return iframeSrc;
    };

    var buttonText = function() {
        return '<a href="'+spreadhseetLocation()+'" target="_blank"><div class="goToSpreadsheet">Go To Spreadsheet View</div></a>';
    };

    var makeButton = function(location) {
        location.prepend(buttonText());
    };

    return {makeButton: makeButton};
})();
