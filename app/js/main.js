(function (w, d, $, $w, $d, undefined) {
    'use strict';

    var $objects = {};
    var entries = [];
    var dateMap = {};
    var $dateCache = $('<option></option>');
    var $entryCache = $('<tr><td class="hour"></td><td class="in"></td><td class="out"></td></tr>');

    function getCurrentDate() {
        var date = new Date();
        return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }

    function getCurrentTime() {
        var time = new Date();
        return ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2);
    }

    var Entry = function (type, value, date, time) {
        this.type = type.toLowerCase() || 'in';
        this.value = parseInt(value) || 0;
        this.date = date || getCurrentDate();
        this.time = time || getCurrentTime();
    };

    function check() {
        if (window.localStorage === undefined) {
            alert('Your browser does not support this app!');
            new Error('Your browser does not support this app!');
        }
    }

    function generateDateMap() {
        var entry;
        var entryHour;
        var i;
        dateMap = {};
        for (i = 0; i < entries.length; i++) {
            /** @type Entry */
            entry = entries[i];
            entryHour = entry.time.split(':')[0];
            if (dateMap[entry.date] === undefined) {
                dateMap[entry.date] = {};
            }
            if (dateMap[entry.date][entryHour] === undefined) {
                dateMap[entry.date][entryHour] = {
                    inTake: 0,
                    outTake: 0
                };
            }
            switch (entry.type) {
                case 'in':
                    dateMap[entry.date][entryHour].inTake += parseInt(entry.value);
                    break;
                case 'out':
                    dateMap[entry.date][entryHour].outTake += parseInt(entry.value);
                    break;
            }
        }
    }

    function load() {
        entries = JSON.parse(localStorage.getItem('entries')) || [];
        generateDateMap();
    }

    function save() {
        localStorage.setItem('entries', JSON.stringify(entries));
    }

    function updateDates() {
        $objects.date.empty();
        var dates = Object.keys(dateMap).sort().reverse();
        var i;
        for (i = 0; i < dates.length; i++) {
            $objects.date.append($dateCache.clone().val(dates[i]).text(dates[i]));
        }
    }

    function showDate(date) {
        $objects.entryTableBody.empty();
        var hours = dateMap[date];
        var totalIn = 0;
        var totalOut = 0;
        var $entry;
        for (var hour in hours) {
            if (hours.hasOwnProperty(hour)) {
                $entry = $entryCache.clone();
                $('.hour', $entry).text(hour);
                $('.in', $entry).text(hours[hour].inTake);
                $('.out', $entry).text(hours[hour].outTake);
                $objects.entryTableBody.append($entry);
                totalIn += hours[hour].inTake;
                totalOut += hours[hour].outTake;
            }
        }
        $objects.dateTotalIn.text(totalIn);
        $objects.dateTotalOut.text(totalOut);
        $objects.dateBalance.text(totalIn - totalOut);
    }

    function addEntry(entry) {
        entries.push(entry);
        save();
        generateDateMap();
        updateDates();
        showDate(entry.date);
    }

    $(function () {
        check();
        load();
        $objects.date = $('#date', d);
        $objects.dateTotalIn = $('#date-total-in', d);
        $objects.dateTotalOut = $('#date-total-out', d);
        $objects.dateBalance = $('#date-balance', d);
        $objects.entryTableBody = $('#entry-table tbody', d);
        $objects.popupDateInput = $('#popup-date-input', d);
        $objects.popupTimeInput = $('#popup-time-input', d);
        updateDates();
    });

    $d
        .on('click', '.popup-button', function () {
            var $popup = $('#popup-' + $(this).data('popup'), d);
            $popup.addClass('show');
        })
        .on('click', '.popup-close-button', function () {
            var $popup = $(this).parent().parent().parent().parent();
            $popup.removeClass('show');
        })
        .on('click', '#entry-add-button', function () {
            var $popup = $(this).parent().parent().parent().parent();
            var type = $('input[name=type]:checked', $popup).val();
            var value = $('input[name=value]', $popup).val();
            var date = $('input[name=date]', $popup).val();
            var time = $('input[name=time]', $popup).val();
            addEntry(new Entry(type, value, date, time));
            $popup.removeClass('show');
        })
        .on('click', '#add-button', function () {
            $objects.popupDateInput.val(getCurrentDate());
            $objects.popupTimeInput.val(getCurrentTime());
        })
        .on('change', '#date', function () {
            showDate($(this).val());
        });

})(window, document, jQuery, jQuery(window), jQuery(document));