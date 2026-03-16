/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.23333333333333, "KoPercent": 1.7666666666666666};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7796666666666666, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.999, 500, 1500, "View Cart Request"], "isController": false}, {"data": [0.999, 500, 1500, "View Product Details"], "isController": false}, {"data": [0.5, 500, 1500, "Login"], "isController": false}, {"data": [0.997, 500, 1500, "View Products"], "isController": false}, {"data": [0.408, 500, 1500, "Add To Cart Request"], "isController": false}, {"data": [0.775, 500, 1500, "Place Order (Delete Cart)"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 53, 1.7666666666666666, 510.23699999999974, 145, 2669, 319.0, 887.0, 1552.7999999999993, 2200.959999999999, 15.503235008371746, 139.65328730756607, 2.58033986320979], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Cart Request", 500, 0, 0.0, 228.88799999999986, 150, 519, 203.0, 316.90000000000003, 347.6499999999999, 435.8600000000001, 2.7153990278871483, 25.563264978819888, 0.3420766353490646], "isController": false}, {"data": ["View Product Details", 500, 0, 0.0, 283.50200000000007, 149, 511, 307.0, 348.90000000000003, 376.95, 453.99, 2.706506441485331, 46.61325122469416, 0.3594578867597705], "isController": false}, {"data": ["Login", 500, 0, 0.0, 770.9980000000006, 621, 1315, 744.5, 874.9000000000001, 970.55, 1111.5100000000004, 2.7650737998197172, 47.41137571235214, 0.5621956690649074], "isController": false}, {"data": ["View Products", 500, 0, 0.0, 215.548, 145, 637, 193.0, 301.80000000000007, 324.9, 445.61000000000035, 2.7466943533457484, 26.933140652724447, 0.34870143157709693], "isController": false}, {"data": ["Add To Cart Request", 500, 46, 9.2, 927.1999999999996, 537, 2669, 638.0, 1986.3000000000002, 2215.6, 2371.98, 2.6965807356272244, 0.6952964890518822, 0.6009372303419265], "isController": false}, {"data": ["Place Order (Delete Cart)", 500, 7, 1.4, 635.2859999999993, 258, 2292, 314.0, 1669.7000000000005, 1867.95, 2034.8400000000001, 2.6680611733065813, 0.5368014015325344, 0.49817704720333833], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,266 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,292 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,158 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,203 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,013 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,073 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 3.7735849056603774, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,035 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,256 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,191 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,280 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 3.7735849056603774, 0.06666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 2,237 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,497 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,251 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,184 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,208 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,272 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,257 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,019 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,201 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,223 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,022 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,033 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,269 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,293 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,092 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,089 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,078 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,372 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,144 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,299 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,100 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,062 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,669 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,305 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,464 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,014 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,370 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,219 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,050 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,197 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,120 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,317 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,287 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,216 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,152 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,128 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,331 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,253 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 2,387 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 1.8867924528301887, 0.03333333333333333], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 53, "The operation lasted too long: It took 2,073 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,280 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,266 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,292 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,158 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Add To Cart Request", 500, 46, "The operation lasted too long: It took 2,073 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,266 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,158 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,144 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Place Order (Delete Cart)", 500, 7, "The operation lasted too long: It took 2,152 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,197 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,019 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,292 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,280 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
