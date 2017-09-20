QUnit.module('Validation');

QUnit.test('Test empty function true on empty', function(assert) {
    assert.ok(validation.empty(''));
    assert.notOk(validation.empty('4234234234'));
});

QUnit.test('Test Amazon URL checker', function(assert) {
    assert.ok(validation.notFromAmazon('google.com/anything'));
    assert.notOk(validation.notFromAmazon('amazon.com/anything'));
    assert.notOk(validation.notFromAmazon('amzn.com/anything'));
});

QUnit.test('Test Amazon URL is not a search results', function(assert) {
    assert.ok(validation.isAnAmazonSearch('amazon.com/s/ref=anything'));        
    assert.notOk(validation.isAnAmazonSearch('amazon.com/anything'));
});

QUnit.test('Test ISBN format check', function(assert) {
    assert.ok(validation.isAnISBN('978-0123456789'));
    assert.ok(validation.isAnISBN('0123456789'));
    assert.ok(validation.isAnISBN('012345678X'));
    assert.ok(validation.isAnISBN('9781433823060'));
    assert.ok(validation.isAnISBN('978-1-59711-382-3'));
    assert.notOk(validation.isAnISBN('123-123456789'), 'Doesn\'t start with 97[8|9]');
    assert.notOk(validation.isAnISBN('1234'), 'Too short');
});

QUnit.test('Test ISBNLike', function(assert) {
    assert.ok(validation.ISBNLike('123-0123456789'));
    assert.ok(validation.ISBNLike('029812X'), 'Only digits and X');
    assert.ok(validation.ISBNLike('X'), 'Will be caught by ISBN check');
    assert.notOk(validation.ISBNLike('ax'), 'Any letter other than X');
    assert.notOk(validation.ISBNLike('012345678xa'), 'Any letter other than x');
});

QUnit.test('Put validation together', function(assert) {
    // notOk and ok look backward because validation returns true if invalid
    assert.ok(validation.invalidEntry('google.com'), 'unsupported');
    assert.ok(validation.invalidEntry('029812X'), 'invalid ISBN');
    assert.ok(validation.invalidEntry('X'), 'invalid ISBN/unknown format');
    assert.ok(validation.invalidEntry('amazon.com/s/ref=anything', 'Amazon search results'));
    assert.notOk(validation.invalidEntry('http://www.amazon.com/anything'), 'valid entry');
    assert.notOk(validation.invalidEntry('https://amzn.com/anything'), 'valid entry');
    assert.notOk(validation.invalidEntry('978-0123456789'), 'valid ISBN');
    assert.notOk(validation.invalidEntry('amazon.com/anything'));
});

QUnit.module('Chart', {
    setup: function() {
        this.fundData = {
            allocated: '2000',
            expended: '1000',
            encumbered: '500',
            remaining: '500'
        };
    }
});

QUnit.test('Test labels', function(assert) {
    var labels =
        '<ul class="fund-labels">'+
            '<li><strong style="color:#000;">Allocated</strong>: 2000</li>'+
            '<li><strong style="color:#088328;">Remaining</strong>: 500 - &#37 25</li>'+
            '<li><strong style="color:#AF5F0B;">Expended</strong>: 1000 - &#37 50</li>'+
            '<li><strong style="color:#0B556D;">Encumbered</strong>: 500 - &#37 25</li>'+
        '</ul>';
    assert.equal(fund.makeLabels(this.fundData), labels);
});

QUnit.module('Reporting', {
    setup: function() {
        this.data = {
            success: false,
            messages: ['This here is an error message']
        };
    }
});

QUnit.test('Test error reporting', function(assert) {
    assert.equal(reporting.buildErrorMessage(this.data), '<p class="error-message">This here is an error message</p>');
});
