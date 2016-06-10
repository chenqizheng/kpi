var session = getUrlParam("session");
var waUrl = getUrlParam("waUrl");
var userID = getUrlParam("userID");
var report_year;
var report_demension;
var report_metric;
var report_dept;
var report_period;
var report_period2;

var barShowIndex;
var needReload;

var demensionIndex;
$(function() {
    $(".navbar a").each(function(index, content) {
        $(content).on('click', function() {
            if (barShowIndex == index) {
                hideSelectBar();
                if (needReload) {
                    needReload = false;
                    getSaleTargetsData();
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
            getSaleTargetsData();
        }
    })
    $("#dimension li").each(function(index, content) {
        $(content).on('click', function() {
            selectDemension(index);
        })
    });
    selectDemension(window.localStorage.demensionIndex);
    //getDepartment();
    getHRPersonList();
});

function selectDemension(index) {
    if (index == undefined) {
        index = 0;
    }
    window.localStorage.demensionIndex = index;
    $("#dimension li").removeClass("active");
    $("#dimension li span").remove()
    var li = $($("#dimension li")[index]);
    li.addClass("active");
    li.prepend("<span class=\"circle\"></span>");
    if (demensionIndex == 0) {
        getDepartment();
    } else {
        getHRPersonList("")
    }
}

function getSaleTargetsData() {
    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WACRMOBJECT',
            actions: {
                action: [{
                    actiontype: "getTargetConditions",
                    reqparams: {
                        "Params": [{
                            "value": userID,
                            "@id": "userid"
                        }, {
                            "value": report_year,
                            "@id": "report_year"
                        }, {
                            "value": report_demension,
                            "@id": "report_demension"
                        }, {
                            "value": report_metric,
                            "@id": "report_metric"
                        }, {
                            "value": report_dept,
                            "@id": "report_dept"
                        }, {
                            "value": report_period,
                            "@id": "report_period"
                        }, {
                            "value": report_period2,
                            "@id": "report_period2"
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {},
        success: function(responseStr) {
            console.log(responseStr);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
}

function getTargetConditions(userID) {
    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WACRMOBJECT',
            actions: {
                action: [{
                    actiontype: "getTargetConditions",
                    reqparams: {
                        "Params": [{
                            "value": userID,
                            "@id": "userid"
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {},
        success: function(responseStr) {
            console.log(responseStr);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
}


function getHRPersonList(deptIds) {
    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WAASARCHIVEREF',
            actions: {
                action: [{
                    actiontype: "getHRPersonReferList",
                    reqparams: {
                        "Params": [{
                            "value": "",
                            "@id": "referid"
                        }, {
                            "value": "",
                            "@id": "refermark"
                        }, {
                            "value": "",
                            "@id": "condition"
                        }, {
                            "value": "1",
                            "@id": "startline"
                        }, {
                            "value": "",
                            "@id": "count"
                        }, {
                            "value": deptIds,
                            "@id": "deptids"
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {},
        success: function(responseStr) {
            console.log(responseStr);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
}

function getDepartment() {
    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WAASARCHIVEREF',
            actions: {
                action: [{
                    actiontype: "getDepartmentReferList",
                    reqparams: {
                        "Params": [{
                            "value": "",
                            "@id": "referid"
                        }, {
                            "value": "",
                            "@id": "refermark"
                        }, {
                            "value": "",
                            "@id": "condition"
                        }, {
                            "value": "1",
                            "@id": "startline"
                        }, {
                            "value": "25",
                            "@id": "count"
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {},
        success: function(responseStr) {
            var actionResponse = responseStr.wacomponents.wacomponent[0].actions.action[0].resresult;
            if (actionResponse.flag == "1") {
                $(".loading").text(actionResponse.desc);
                return;
            }
            initDepartment(actionResponse.servicecodesres.servicecoderes[0].resdata.struct[0].referlist.group[0].referinfo);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {}
    })
}

function initDepartment(departments) {
    $(".nav-list-01").empty();
    $.each(departments,function(index,department){
        $(".nav-list-01").append("<p>" + department.refername + "</p>");
    })
    $(".nav-list-01 p").each(function(index, content) {
        $(content).on('click', function() {
            $(".nav-list-01 p.active").removeClass("active");
            $(this).addClass('active');
        });
    });
}

function hideSelectBar() {
    $(".mask").hide();
    $(".navbar a").removeClass("active");
    $(".mask-content").find("ol").removeClass("block");
    barShowIndex = undefined;
}
