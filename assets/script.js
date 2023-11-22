/* ----------------------------------------------------------
  Data
---------------------------------------------------------- */

window.jsutaxes = {
    numberkids: 0,
    ratio: 1,
    tax1: 0,
    tax2: 0,
    taxhalf: 0,
    taxpart1: 0,
    taxpart2: 0,
    taxcommontotal: 0,
};

/* ----------------------------------------------------------
  Events
---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", function() {
    'use strict';

    var $revenu1 = document.getElementById('revenu_1');
    var $revenu2 = document.getElementById('revenu_2');
    var $childcount = document.getElementById('childcount');

    var _events = ['keyup', 'keydown'];
    Array.prototype.forEach.call(document.querySelectorAll('input[data-watch-change]'), function(el) {
        for (var _ev in _events) {
            el.addEventListener(_events[_ev], compute_taxes, 1);
        }
    });
    compute_taxes();

    function compute_taxes() {
        window.jsutaxes.numberkids = parseInt($childcount.value, 10);
        if (!window.jsutaxes.numberkids) {
            window.jsutaxes.numberkids = 0;
        }

        var _revenu1 = $revenu1.value.length === 0 ? 0 : parseInt($revenu1.value, 10);
        var _revenu2 = $revenu2.value.length === 0 ? 0 : parseInt($revenu2.value, 10);
        var _total_foyer = (_revenu1 + _revenu2);

        if(!_revenu1){
            _revenu1 = 0;
        }
        if(!_revenu2){
            _revenu2 = 0;
        }

        /* Separate */
        window.jsutaxes.tax1 = apply_quotient(calculateTax(_revenu1), 1);
        window.jsutaxes.tax2 = apply_quotient(calculateTax(_revenu2), 1);

        /* Half */
        window.jsutaxes.taxhalf = apply_quotient(calculateTax(_total_foyer / 2), 2);
        window.jsutaxes.taxcommontotal = window.jsutaxes.taxhalf * 2;

        /* Part sur revenus */
        var taxpart1 = _revenu1 / _total_foyer * window.jsutaxes.taxcommontotal;
        var taxpart2 = _revenu2 / _total_foyer * window.jsutaxes.taxcommontotal;
        window.jsutaxes.taxpart1 = isNaN(taxpart1) ? 0 : taxpart1;
        window.jsutaxes.taxpart2 = isNaN(taxpart2) ? 0 : taxpart2;

        update_content();
    }

});

/* ----------------------------------------------------------
  Compute
---------------------------------------------------------- */

function apply_quotient(value, _total_parts) {
    var _plaf = 1678,
        _reduc = 0,
        _max_plaf = 0,
        _nbpart = 0;

    /* Nb parts */
    _nbpart += window.jsutaxes.numberkids / 2;
    if (window.jsutaxes.numberkids > 2) {
        _nbpart += window.jsutaxes.numberkids - 2;
    }
    _total_parts += _nbpart;

    /* plaf has a max value */
    _max_plaf = _plaf * _nbpart;

    /* Compute reduc */
    _reduc = value - value / _total_parts;
    _reduc = Math.min(_max_plaf, _reduc);

    return value - _reduc;
}

function calculateTax(income) {
    var taxBrackets = [{
        upperLimit: 10777,
        rate: 0.00
    }, {
        upperLimit: 27478,
        rate: 0.11
    }, {
        upperLimit: 78570,
        rate: 0.30
    }, {
        upperLimit: 168994,
        rate: 0.41
    }, {
        upperLimit: Infinity,
        rate: 0.45
    }];
    var tax = 0;
    var lowerLimit = 0;

    /* Frais pro */
    income -= 0.1 * income;

    /* Compute */
    for (var i = 0; i < taxBrackets.length; i++) {
        if (income > taxBrackets[i].upperLimit) {
            tax += (taxBrackets[i].upperLimit - lowerLimit) * taxBrackets[i].rate;
        }
        else {
            tax += (income - lowerLimit) * taxBrackets[i].rate;
            break;
        }
        lowerLimit = taxBrackets[i].upperLimit;
    }

    return Math.floor(tax.toFixed(2));
}

/* ----------------------------------------------------------
  Display
---------------------------------------------------------- */

function get_info_content(_tax, _id) {
    var _html = '';
    var _mensualite = Math.floor(_tax / 12);
    _html += '<p class="result-item">';
    _html += '<u>Revenu ' + _id + '</u><br/>';
    _html += Math.floor(_tax) + '&nbsp;&euro;/an - ' + Math.floor(_mensualite) + '&nbsp;&euro;/mois';
    _html += '</p>';

    return _html;
}

function update_content() {
    var _html = '';

    /* Impots solo */
    _html += get_info_content(window.jsutaxes.tax1, 1);
    _html += get_info_content(window.jsutaxes.tax2, 2);
    _html += '<p>Total: ' + Math.floor(window.jsutaxes.tax1 + window.jsutaxes.tax2) + '&nbsp;&euro;</p>';
    document.getElementById('result_sep').innerHTML = _html;

    /* Half */
    var _html2 = '';
    _html2 += get_info_content(window.jsutaxes.taxhalf, 1);
    _html2 += get_info_content(window.jsutaxes.taxhalf, 2);
    _html2 += '<p>Total: ' + Math.floor(window.jsutaxes.taxcommontotal) + '&nbsp;&euro;</p>';
    document.getElementById('result_half').innerHTML = _html2;

    /* Part */
    var _html3 = '';
    _html3 += get_info_content(window.jsutaxes.taxpart1, 1);
    _html3 += get_info_content(window.jsutaxes.taxpart2, 2);
    _html3 += '<p>Total: ' + Math.floor(window.jsutaxes.taxcommontotal) + '&nbsp;&euro;</p>';
    document.getElementById('result_part').innerHTML = _html3;

}
