var session = getUrlParam("session");
var userID = getUrlParam("userID");
var today = getUrlParam("today");
var waUrl = getUrlParam("waUrl");
var os = getUrlParam("os");
var groupId = getUrlParam("groupId");
var entcode = getUrlParam("encntcode")
var key = entcode + "_" + groupId + "_" + userID + "_";
var Metric = window.localStorage[key + "Metric"];
var Period = window.localStorage[key + "Period"];
var PeriodVal = window.localStorage[key + "PeriodVal"];
var Dimension = window.localStorage[key + "Dimension"];
var RangeTop = window.localStorage[key + "RangeTop"];

var barShowIndex;
var condList;
var needReload = false;
var clickable = true;

$(function() {
    $(".row-left").css('top', 18);
    // window.onscroll = function() {
    //     $(".topfix").css("top", $(window).scrollTop());
    // };
    $(".navbar a").each(function(index, content) {
        $(content).on('click', function() {
            if (!clickable) {
                return;
            }
            if (barShowIndex == index) {
                hideSelectBar();
                if (needReload) {
                    needReload = false;
                    getData();
                }
            } else {
                $(".mask").show();
                $(this).siblings().removeClass("active");
                $(this).addClass("active");
                var content = $(".mask-content").find("ol");
                content.eq(index).siblings("ol").removeClass("block")
                content.eq(index).addClass("block");
                barShowIndex = index;
            }
        })
    });
    $(".mask").on('click', function() {
        hideSelectBar();
        if (needReload) {
            needReload = false;
            getData();
        }
    })
    getData();
});

function hideSelectBar() {
    $(".mask").hide();
    $(".navbar a").removeClass("active");
    $(".mask-content").find("ol").removeClass("block");
    barShowIndex = undefined;
}

var xVal = [];
var yVal = [];
var rank = [];
var max;

function getData() {
    saveSelect();
    var paramStr = "";
    if (Metric != undefined) {
        paramStr = paramStr + "{\"@id\":\"Metric\",\"value\":\"" + Metric + "\"},";
    }
    if (Dimension != undefined) {
        paramStr = paramStr + "{\"@id\":\"Dimension\",\"value\":\"" + Dimension + "\"},";
    }
    if (RangeTop != undefined) {
        paramStr = paramStr + "{\"@id\":\"RangeTop\",\"value\":\"" + RangeTop + "\"},";
    }
    if (Period != undefined) {
        paramStr = paramStr + "{\"@id\":\"Period\",\"value\":\"" + Period + "\"},";
    }
    if (PeriodVal != undefined) {
        paramStr = paramStr + "{\"@id\":\"PeriodVal\",\"value\":\"" + PeriodVal + "\"},";
    }
    if (today != undefined) {
        paramStr = paramStr + "{\"@id\":\"today\",\"value\":\"" + today + "\"},";
    }
    if (userID != undefined) {
        paramStr = paramStr + "{\"@id\":\"userID\",\"value\":\"" + userID + "\"},";
    }

    paramStr = paramStr.substr(0, paramStr.length - 1);


    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WACRMOBJECT',
            actions: {
                action: [{
                    actiontype: "getKPIService",
                    reqparams: {
                        Params: [{
                            "@id": "Metric",
                            "value": Metric
                        }, {
                            "@id": "Dimension",
                            "value": Dimension
                        }, {
                            "@id": "RangeTop",
                            "value": RangeTop
                        }, {
                            "@id": "Period",
                            "value": Period
                        }, {
                            "@id": "PeriodVal",
                            "value": PeriodVal
                        }, {
                            "@id": "today",
                            "value": today
                        }, {
                            "@id": "userID",
                            "value": userID
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {
            showProgressDialog();
        },
        success: function(responseStr) {
            hideProgressDialog();
            xVal = [];
            yVal = [];
            rank = [];
            var response;
            if (Object.prototype.toString.call(responseStr) === "[object String]") {
                response = JSON.parse(responseStr);
            } else {
                response = responseStr;
            }
            var actionResponse = response.wacomponents.wacomponent[0].actions.action[0].resresult;
            if (actionResponse.flag == "1") {
                $(".loading").text(actionResponse.desc);
                return;
            }
            var kpilist = response.wacomponents.wacomponent[0].actions.action[0].resresult.servicecodesres.servicecoderes[0].resdata.struct[0].kpilist;
            if (kpilist.datalist instanceof Array) {
                var isIgnoreMine = false;
                for (var i = 0; i < kpilist.datalist.length; i++) {
                    var data = kpilist.datalist[i];
                    if (i == 0 && (Dimension == "Department" && data.rank != "Error")) {
                        isIgnoreMine = true;
                        continue;
                    }

                    var index = i - (isIgnoreMine ? 1 : 0);
                    xVal[index] = data.dimensionVal;
                    yVal[index] = data.metricVal;
                    rank[index] = data.rank;
                    //i = 1 为最大值
                    if (i == 1) {
                        max = data.metricVal
                    }
                }
            } else if (kpilist.datalist.metricVal != undefined && dimension != "Department") {
                xVal[0] = kpilist.datalist.dimensionVal;
                yVal[0] = kpilist.datalist.metricVal;
                rank[0] = kpilist.datalist.rank;
            }

            var title;
            var unit;
            var subTitle;
            for (var condIndex = 0; condIndex < kpilist.condlist.length; condIndex++) {
                cond = kpilist.condlist[condIndex];
                if (cond.name == "Metric") {
                    if (Metric == "") {
                        $.each(cond.itemlist, function(n, item) {
                            if (item.def == "1") {
                                title = item.title;
                                unit = item.unit;
                            }
                        });
                    } else {
                        $.each(cond.itemlist, function(n, item) {
                            if (item.value == Metric) {
                                title = item.title;
                                unit = item.unit;
                            }
                        });
                    }
                } else if (cond.name == "Period") {
                    if (Period == "") {
                        $.each(cond.itemlist, function(n, item) {
                            if (item.def == "1") {
                                if (item.childlist != undefined) {
                                    $.each(item.childlist, function(n, childitem) {
                                        if (childitem.def == "1") {
                                            subTitle = childitem.title;
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        $.each(cond.itemlist, function(n, item) {
                            if (item.value == Period) {
                                if (item.childlist != undefined) {
                                    $.each(item.childlist, function(n, childitem) {
                                        if (childitem.value == PeriodVal) {
                                            subTitle = childitem.title;
                                        }
                                    });
                                }
                            }
                        });

                    }
                }
            }
            condList = kpilist.condlist;
            initList(unit);
            initCondList();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            $("#loading").empty();
        }
    })
}

function initList(unit) {
    function getYVal(yVal) {
        if (Metric == "saleinvoicesum" || Metric == "saleordersum" || Metric == "saledeliversum" || Metric == "argatheringsum") {
            return fmoney(yVal, 2);
        } else {
            return yVal;
        }
    }
    var isError = (rank[0] == 'Error');
    var myRank = (yVal[0] == '0' ? "" : (isError ? "" : ("第" + rank[0] + "名")));
    $(".person-info .left h4").text(xVal[0]);
    $(".person-info .left p").text(myRank);

    $(".person-list ul").empty();
    var startIndex = 0;
    var isDepartment = false;
    if (Dimension == "Department") {
        $(".person-info").hide();
        $(".person-list").addClass("person-list-department");
        startIndex = 0;
        isDepartment = true;
    } else {
        $(".person-list").removeClass("person-list-department");
        $(".person-info").show();
        startIndex = 1;
    }
    if(isError){
        $(".person-info").show();
        $(".person-info span ").hide();
        $(".person-list").hide();
    } else {
        if(isDepartment){
            $(".person-info").hide();
            $(".person-list").show();
        } else {
            $(".person-info span ").show();
            $(".person-info span ").text(getYVal(yVal[0]) + ((unit == undefined) ? "" : unit));
            $(".person-list").show();
        }
    }

    for (var i = startIndex; i < xVal.length; i++) {
        var progress = yVal[i] / max * 100;
        var temp = isDepartment ? i + 1 : i;
        $(".person-list ul").append("<li>\n" +
            "            <div class=\"clear\">\n" +
            "                <div class=\"left\">\n" +
            "                    <span>" + temp + "</span>" + xVal[i] + (temp == 1 ? "<i class=\"icon-first\"></i>\n" : "") +
            "                </div>\n" +
            "                <div class=\"right\"><span>" + getYVal(yVal[i]) + (unit == undefined ? "" : unit) + "</span></div>\n" +
            "            </div>\n" +
            "            <div class=\"progress\">\n" +
            "                <div class=\"progress-bar first\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: " + progress + "%;\">\n" +
            "                </div>\n" +
            "            </div>\n" +
            "        </li>");
    }
}

var periodSelect;

function initCondList() {
    // $("#metric").text(condList[0].title);
    // $("#dimension_name").text(condList[1].title);
    // $("#period_name").text(condList[2].title);
    // $("#rank_name").text(condList[3].title);
    var metricSel;

    for (var barIndex = 0; barIndex < 4; barIndex++) {
        var barKey;
        if (barIndex == 0) {
            barKey = "Metric";
        } else if (barIndex == 1) {
            barKey = "Dimension";
        } else if (barIndex == 2) {
            // 不处理期间，样式不同
            continue;
        } else if (barIndex == 3) {
            barKey = "RangeTop";
        }
        var listIdIndex = barIndex + 1;
        $(".nav-list-0" + listIdIndex).empty();
        var isSetSelect = false;
        var defIndex = 0;
        $.each(condList[getCondIndex(condList, barKey)].itemlist, function(i, val) {
            var isSelect = false;
            if (eval(barKey) == val.value) {
                isSelect = true;
                isSetSelect = true;
                setSelectItem(barKey, val)
            }
            if (val.def == "1") {
                defIndex = i;
            }

            if (isSelect) {
                $(".nav-list-0" + listIdIndex).append("<p" + " class=\"active\"" + ">" + val.title + "</p>");
            } else {
                $(".nav-list-0" + listIdIndex).append("<p>" + val.title + "</p>");
            }


            $(".nav-list-0" + listIdIndex + " p").each(function(index, content) {
                $(content).on('click', function() {
                    $("." + this.parentElement.className + " p.active").removeClass("active");
                    $(this).addClass('active');
                    var condIndex;
                    if (barShowIndex == 0) {
                        condIndex = 0;
                    } else if (barShowIndex == 1) {
                        condIndex = 2;
                    } else if (barShowIndex == 3) {
                        condIndex = 3;
                    } else if (barShowIndex == 2) {
                        return;
                    }
                    var item = condList[condIndex].itemlist[index];
                    if (barShowIndex == 0) {
                        setSelectItem("Metric", item);
                    } else if (barShowIndex == 1) {
                        setSelectItem("Dimension", item);
                    } else if (barShowIndex == 3) {
                        setSelectItem("RangeTop", item);
                    }
                    hideSelectBar();
                    getData();
                });
            });

        });
        if (!isSetSelect) {
            $(".nav-list-0" + listIdIndex + " p").eq(defIndex).addClass("active");
            setSelectItem(barKey, condList[getCondIndex(condList, barKey)].itemlist[defIndex]);
        }

        function setSelectItem(barKey, val) {
            if (barKey == "Metric") {
                Metric = val.value;
                var title = val.title.length > 5 ? val.title.substr(0, 5) + "..." : val.title;
                $("#Metric").html(title + "<i class=\"icon-rowbottom\"></i>");
            } else if (barKey == "Dimension") {
                Dimension = val.value;
                $("#Dimension").html(val.title + "<i class=\"icon-rowbottom\"></i>");
            } else if (barKey == "RangeTop") {
                RangeTop = val.value;
                $("#RangeTop").html(val.title + "<i class=\"icon-rowbottom\"></i>");
            }
        }
    }

    $(".nav-list-03").empty();
    var periodDef;
    var isSetSelect = false;
    $(".nav-list-03").append("<em class=\"row-left\"></em>")
    $.each(condList[1].itemlist, function(i, val) {
        if (Period == val.value) {
            $(".nav-list-03").append("<p class=\"active\"><span class=\"circle\"></span>" + val.title + "</p");
            periodSelect = i;
            isSetSelect = true;
            if ("year" == Period) {
                $("#PeriodVal").html(condList[1].itemlist[periodSelect].title + "<i class=\"icon-rowbottom\"></i>");
            }
        } else {
            $(".nav-list-03").append("<p>" + val.title + "</p>");
        }
        if (val.def == "1") {
            periodDef = i;
        }

        $(".nav-list-03 p").each(function(index, content) {
            $(content).on('click', function() {
                $(".nav-list-03 p.active").removeClass("active");
                $(".nav-list-03 p span").remove()
                $(this).addClass('active');
                $(this).prepend("<span class=\"circle\"></span>");
                periodSelect = index;
                Period = condList[1].itemlist[index].value;
                PeriodVal = undefined;
                initPeriodVal();
                if ("year" == Period) {
                    hideSelectBar();
                    $("#PeriodVal").html("<i class=\"icon-rowbottom\"></i>" + condList[1].itemlist[periodSelect].title);
                    getData();
                } else {
                    needReload = true;
                }
                var top = 18 + 40 * (periodSelect);
                $(".row-left").css("margin-top", top + "px");
            });
        });
    });
    if (!isSetSelect) {
        periodSelect = periodDef;
        $(".nav-list-03 p").eq(defIndex).addClass("active");
        $(".nav-list-03 p").eq(defIndex).prepend("<span class=\"circle\"></span>");
    }
    var top = 18 + 40 * (periodSelect);
    $(".row-left").css("margin-top", top + "px");
    initPeriodVal();
}

function getCondIndex(condList, name) {
    var index = -1;
    $.each(condList, function(i, val) {
        if (val.name == name) {
            index = i;
        }
    });
    return index;
}


function initPeriodVal() {
    $(".nav-list-03-01").empty();
    if ("year" == Period) {
        return;
    }
    var isSetSelect = false;
    var defIndex = 0;
    $.each(condList[1].itemlist[periodSelect].childlist, function(i, val) {
        var isSelect = false;
        if (PeriodVal == val.value) {
            isSelect = true;
            isSetSelect = true;
        }
        if (val.def == "1") {
            defIndex = i;
        }
        if (isSelect) {
            PeriodVal = val.value;
            $("#PeriodVal").html(val.title + "<i class=\"icon-rowbottom\"></i>");
            $(".nav-list-03-01").append("<p class=\"active\">" + val.title + "<span class=\"circle\"></span></p>");;
        } else {
            $(".nav-list-03-01").append("<p>" + val.title + "</p>");
        }
    });
    if (!isSetSelect) {
        $(".nav-list-03-01 p").eq(defIndex).addClass("active");
        var item = condList[1].itemlist[periodSelect].childlist[defIndex];
        PeriodVal = item.value;
        $("#PeriodVal").html(item.title + "<i class=\"icon-rowbottom\"></i>");
    }
    $(".nav-list-03-01 p").each(function(index, content) {
        $(content).on('click', function() {
            $(".nav-list-03-01 p.active").removeClass("active");
            $(this).addClass('active');
            var item = condList[1].itemlist[periodSelect].childlist[index];
            PeriodVal = item.value;
            hideSelectBar();
            $("#PeriodVal").html(item.title + "<i class=\"icon-rowbottom\"></i>");
            getData();
        });
    });
}

function saveSelect() {
    if (Metric != undefined) {
        window.localStorage.setItem(key + "Metric", Metric);
    }
    if (Dimension != undefined) {
        window.localStorage.setItem(key + "Dimension", Dimension);
    }
    if (RangeTop != undefined) {
        window.localStorage.setItem(key + "RangeTop", RangeTop);
    }
    if (Period != undefined) {
        window.localStorage.setItem(key + "Period", Period);
    }
    if (PeriodVal != undefined) {
        window.localStorage.setItem(key + "PeriodVal", PeriodVal);
    }
}

function hideProgressDialog() {
    $(".loading").hide();
    clickable = true;
}

function showProgressDialog() {
    $(".loading").show();
    clickable = false;
}
