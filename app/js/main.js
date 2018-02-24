(function (w, d, $, $w, $d, undefined) {
    'use strict';

    var $objects = {};
    var entries = [];
    var dateMap = {};
    var $dateCache = $('<option></option>');
    var $entryCache = $('<tr><td class="hour"></td><td class="in"></td><td class="out"></td></tr>');
    var graphChart;

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
                    intake: 0,
                    output: 0,
                    intakes: [],
                    outputs: []
                };
            }
            switch (entry.type) {
                case 'in':
                    dateMap[entry.date][entryHour].intake += parseInt(entry.value);
                    dateMap[entry.date][entryHour].intakes.push(entry);
                    break;
                case 'out':
                    dateMap[entry.date][entryHour].output += parseInt(entry.value);
                    dateMap[entry.date][entryHour].outputs.push(entry);
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
        $objects.tableDate.empty();
        $objects.graphDate.empty();
        var dates = Object.keys(dateMap).sort().reverse();
        var i;
        for (i = 0; i < dates.length; i++) {
            $objects.tableDate.append($dateCache.clone().val(dates[i]).text(dates[i]));
            $objects.graphDate.append($dateCache.clone().val(dates[i]).text(dates[i]));
        }
        $objects.tableDate.val(dates[0]);
        $objects.graphDate.val(dates[0]);
        showDate(dates[0]);
    }

    function showDate(date) {
        $objects.entryTableBody.empty();
        var hourMap = dateMap[date];
        var hours = Object.keys(hourMap).sort();
        var hour;
        var totalIn = 0;
        var totalOut = 0;
        var $entry;
        var i;
        for (i = 0; i < hours.length; i++) {
            hour = hours[i];
            $entry = $entryCache.clone();
            $('.hour', $entry).text(hour);
            $('.in', $entry).text(hourMap[hour].intake);
            $('.out', $entry).text(hourMap[hour].output);
            $objects.entryTableBody.append($entry);
            totalIn += hourMap[hour].intake;
            totalOut += hourMap[hour].output;
        }
        $objects.tableDateTotalIn.text(totalIn);
        $objects.tableDateTotalOut.text(totalOut);
        $objects.tableDateBalance.text(totalIn - totalOut);
    }

    function addEntry(entry) {
        entries.push(entry);
        save();
        generateDateMap();
        updateDates();
        showDate(entry.date);
    }

    function showDateGraph(date) {
        var hourMap = dateMap[date];
        var hours = Object.keys(hourMap).sort();
        var intakeData = [];
        var outputData = [];
        var i;
        for (i = 0; i < hours.length; i++) {
            intakeData.push(hourMap[hours[i]].intake);
            outputData.push(hourMap[hours[i]].output);
        }
        graphChart = new Chart($objects.graphCanvas.get(0).getContext('2d'), {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Intake',
                    fill: false,
                    backgroundColor: '#4CAF50',
                    borderColor: '#4CAF50',
                    data: intakeData
                }, {
                    label: 'Output',
                    fill: false,
                    backgroundColor: '#FFC107',
                    borderColor: '#FFC107',
                    data: outputData
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                title: {
                    display: true,
                    text: 'Day Chart'
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hour'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        });
    }

    $(function () {
        check();
        load();
        $objects.viewTableButton = $('#view-table-button', d);
        $objects.viewGraphButton = $('#view-graph-button', d);
        $objects.viewTable = $('#view-table', d);
        $objects.viewGraph = $('#view-graph', d);
        $objects.tableDate = $('#table-date', d);
        $objects.tableDateTotalIn = $('#table-date-total-in', d);
        $objects.tableDateTotalOut = $('#table-date-total-out', d);
        $objects.tableDateBalance = $('#table-date-balance', d);
        $objects.entryTableBody = $('#entry-table tbody', d);
        $objects.popupDateInput = $('#popup-date-input', d);
        $objects.popupTimeInput = $('#popup-time-input', d);
        $objects.graphDate = $('#graph-date', d);
        $objects.graphCanvas = $('#graph-canvas', d);
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
        .on('change', '#table-date', function () {
            showDate($(this).val());
        })
        .on('click', '#view-graph-button', function () {
            $objects.viewGraphButton.hide();
            $objects.viewTableButton.show();
            $objects.viewGraph.show();
            $objects.viewTable.hide();
            showDateGraph(Object.keys(dateMap)[0]);
        })
        .on('click', '#view-table-button', function () {
            $objects.viewGraphButton.show();
            $objects.viewTableButton.hide();
            $objects.viewGraph.hide();
            $objects.viewTable.show();
        })
        .on('change', '#graph-date', function () {
            showDateGraph($(this).val());
        });

})(window, document, jQuery, jQuery(window), jQuery(document));