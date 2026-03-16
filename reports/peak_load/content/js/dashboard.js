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

    var data = {"OkPercent": 99.05555555555556, "KoPercent": 0.9444444444444444};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7972222222222223, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "View Cart Request"], "isController": false}, {"data": [0.9983333333333333, 500, 1500, "View Product Details"], "isController": false}, {"data": [0.49833333333333335, 500, 1500, "Login"], "isController": false}, {"data": [1.0, 500, 1500, "View Products"], "isController": false}, {"data": [0.42833333333333334, 500, 1500, "Add To Cart Request"], "isController": false}, {"data": [0.8583333333333333, 500, 1500, "Place Order (Delete Cart)"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 17, 0.9444444444444444, 471.939444444445, 145, 2317, 312.0, 786.9000000000001, 1320.5999999999985, 1986.95, 13.782119996324768, 121.73795494155998, 2.2938795423570486], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["View Cart Request", 300, 0, 0.0, 224.0333333333333, 146, 398, 197.5, 319.80000000000007, 333.9, 368.8900000000001, 2.4354009887728014, 22.775034463460866, 0.3068034448746986], "isController": false}, {"data": ["View Product Details", 300, 0, 0.0, 283.29333333333324, 152, 534, 304.5, 343.90000000000003, 369.9, 434.8600000000001, 2.489440622692081, 42.398196465098046, 0.330628832701292], "isController": false}, {"data": ["Login", 300, 0, 0.0, 762.1066666666668, 677, 1598, 744.0, 818.9000000000001, 855.0, 1296.9500000000019, 2.49474025596035, 42.77614663199671, 0.5072313684481884], "isController": false}, {"data": ["View Products", 300, 0, 0.0, 204.24, 145, 371, 185.5, 293.0, 314.9, 342.98, 2.5203941896512614, 22.708275793084038, 0.31997191860807034], "isController": false}, {"data": ["Add To Cart Request", 300, 10, 3.3333333333333335, 826.3966666666672, 530, 2317, 613.0, 1695.8000000000002, 1967.5, 2237.5400000000004, 2.467044398575693, 0.6360348840077958, 0.549784698979466], "isController": false}, {"data": ["Place Order (Delete Cart)", 300, 7, 2.3333333333333335, 531.5666666666664, 258, 2268, 295.0, 1427.5000000000002, 1621.6, 2194.8500000000004, 2.3972575373772402, 0.4822920079429133, 0.4476129308071566], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,034 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,268 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,317 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,136 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,238 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,192 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,258 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 11.764705882352942, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 2,059 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,064 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,018 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,180 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,121 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,195 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,184 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 2,058 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.882352941176471, 0.05555555555555555], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1800, 17, "The operation lasted too long: It took 2,258 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,034 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,268 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,317 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Add To Cart Request", 300, 10, "The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,018 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,317 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,136 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,238 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Place Order (Delete Cart)", 300, 7, "The operation lasted too long: It took 2,034 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,180 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,268 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,121 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,195 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
