var errorTip = "无法连接到服务器。";
var hanzi = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
var session = getUrlParam("session");
var waUrl = getUrlParam("waUrl");
var userID = getUrlParam("userID");
var groupId = getUrlParam("groupId");
var entcode = getUrlParam("encntcode")
var key = entcode + "_" + groupId + "_" + userID + "_";

var report_year = window.localStorage[key + "report_year"];
var report_demension = window.localStorage[key + "report_demension"];
var report_metric = window.localStorage[key + "report_metric"];
var report_dept = window.localStorage[key + "report_dept"];
var report_person = window.localStorage[key + "report_person"];
var report_period = window.localStorage[key + "report_period"];
var report_period2 = window.localStorage[key + "report_period2"];
var demensionIndex = window.localStorage[key + "demensionIndex"];;
var periodIndex = window.localStorage[key + "periodIndex"];

var barShowIndex;
var needReload;

var conditions;
var departments;
var personList;

var temp = window.localStorage[key + "selectDepartment"];
var selectDepartment = temp == undefined ? undefined : JSON.parse(temp);
var selectDemensionIndex = window.localStorage[key + "selectDemensionIndex"]
var selectConditionName;

var targetData;
var clickable = true;

String.prototype.trim=function() {

    return this.replace(/(^\s*)|(\s*$)/g,'');
}

$(function() {
    getData();
    initPeriodView();
    $(".navbar a").each(function(index, content) {
        $(content).on('click', function() {
            if (!clickable) {
                return;
            }
            if (barShowIndex == index) {
                hideSelectBar();
                if (needReload) {
                    needReload = false;
                    getSaleTargetsDataPrepare();
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

    $("#clear_dimension_list").on("click", function() {
        selectDepartment = [];
        $(".nav-list-04 p").removeClass("active")
        $(".nav-list-04 p").find("label span.icon-check-on").removeClass("icon-check-on")
        $(".nav-list-04 p").find("label span").addClass("icon-check")
    })
    $("#ok_dimension_list").on("click", function() {
        if (selectDepartment.length == 0) {
            showNodata();
        } else {
            getHRPersonList();
        }
        hideSelectBar();
    })
    $(".mask").on('click', function() {
        hideSelectBar();
        if (needReload) {
            needReload = false;
            getSaleTargetsDataPrepare();
        }
    })

    if (demensionIndex == undefined) {
        demensionIndex = 1;
    }
    $("#dimension_list li").each(function(index, content) {
        $(content).on('click', function() {
            selectDemensionIndex = index;
            $("#dimension_list li.active").removeClass("active");
            $("#dimension_list li span").remove()
            $(content).addClass('active');
            $(content).prepend("<span class=\"circle\"></span>");
            demensionIndex = index;
            initDimensionContent();
            if (index != 1) {
                getSaleTargetsDataPrepare();
            }
            initDimensionTitle();
        })
    });

    function initDimensionTitle() {
        var title;
        if (demensionIndex == 0) {
            title = "部门";
        } else if (demensionIndex == 1) {
            title = "业务员";
        } else if (demensionIndex == 2) {
            title = "我的";
        }
        $("#Dimension").html(title + "<i class=\"icon-rowbottom\"></i>");
    }
    $("#dimension_list li:eq(" + demensionIndex + ")").addClass('active');
    $("#dimension_list li:eq(" + demensionIndex + ")").prepend("<span class=\"circle\"></span>");
    initDimensionTitle();
    // getSaleTargetsDataPrepare();
});

function initDimensionContent() {
    if (demensionIndex == 0) {
        //维度: 部门
        $("#dimension_list_btn_group").hide()
        $(".nav-list-04").empty();
        hideSelectBar();

    } else if (demensionIndex == 1) {
        //维度：业务员
        $("#dimension_list_btn_group").show()
        initDepartment();
    } else if (demensionIndex == 2) {
        //维度：我
        $("#dimension_list_btn_group").hide()
        $(".nav-list-04").empty();
        hideSelectBar();
    }
}

$(function() {
    $('.nav-list-04 p span').on('click', function() {
        if ($(this).attr('class') == 'icon-check') {
            $(this).attr('class', 'icon-check-on');
        } else {
            $(this).attr('class', 'icon-check');
        }
    });

    $('.nav-list-05 span').on('click', function() {
        if ($(this).attr('class') == 'icon-check') {
            $(this).attr('class', 'icon-check-on');
            $('.nav-list-04 p span').attr('class', 'icon-check-on');
        } else {
            $(this).attr('class', 'icon-check');
            $('.nav-list-04 p span').attr('class', 'icon-check');
        }
    });
})

function getSaleTargetsDataPrepare() {
    hideNodata();
    if (demensionIndex == 1) {
        getHRPersonList();
    } else {
        getSaleTargetsData();
    }
}

function getSaleTargetsData() {
    report_dept = "";
    report_person = "";
    if (demensionIndex == 0) {
        report_demension = "Department";
        $.each(departments, function(index, val) {
            if (val != undefined) {
                report_dept = report_dept + val.referid + ","
            }
        })
        report_dept = report_dept.substr(0, report_dept.length - 1);
    } else if (demensionIndex == 1) {
        if(personList == undefined || personList.length == 0 ){
            showNodata();
            return;
        }
        report_demension = "Person";
        $.each(personList, function(index, refer) {
            report_person = report_person + "'" + refer.referid + "'" + ","
        })
        report_person = report_person.substr(0, report_person.length - 1);
    } else if (demensionIndex == 2) {
        report_demension = "Person";
        report_person = "'" + userID + "'";
    }
    if (periodIndex == 0) {
        report_period = "week";
    } else if (periodIndex == 1) {
        report_period = "month"
    } else if (periodIndex == 2) {
        report_period = "quarter";
    }
    saveSelect();
    showProgressDialog();
    sendWARequest({
        waUrl: waUrl,
        session: session,
        wacomponent: [{
            componentid: 'WACRMOBJECT',
            actions: {
                action: [{
                    actiontype: "getSaleTargetsData",
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
                            "value": report_person,
                            "@id": "report_person"
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
        success: function(response) {
            var actionResponse = response.wacomponents.wacomponent[0].actions.action[0].resresult;
            if (actionResponse.flag == "1") {
                dismissProgressDialog();
                showErrorView(actionResponse.desc);
                return;
            } else {
                var data;
                try{
                    data = JSON.parse(actionResponse.servicecodesres.servicecoderes[0].resdata.struct[0].datavalue[0].value);
                } catch(e) {
                    data = [];
                }
                initData(data);
                dismissProgressDialog();
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            dismissProgressDialog();
            showErrorView(errorTip);
        }
    })
}

function showProgressDialog() {
    hideNodata();
    $(".tip").hide();
    $(".loading").show();
    clickable = false;
}

function dismissProgressDialog() {
    $(".loading").hide();
    clickable = true;
}

function getHRPersonList() {
    var deptIds = "";
    if (selectDepartment != undefined) {
        if(selectDepartment.length == 0 ){
            showNodata();
            return;
        }
        $.each(selectDepartment, function(index, referid) {
            deptIds = deptIds + referid + ",";
        })
        deptIds = deptIds.substr(0, deptIds.length - 1);
    } else {
        deptIds = "";
    }
    showProgressDialog();
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
                            "value": deptIds,
                            "@id": "deptids"
                        },{
                            "value": "0",
                            "@id": "startline"
                        },{
                            "value": "10000",
                            "@id": "count"
                        }]
                    }
                }]
            }
        }],
        beforeSend: function(XMLHttpRequest) {},
        success: function(responseStr) {
            dismissProgressDialog();
            var response;
            if (Object.prototype.toString.call(responseStr) === "[object String]") {
                response = JSON.parse(responseStr);
            } else {
                response = responseStr;
            }
            var actionResponse = response.wacomponents.wacomponent[0].actions.action[0].resresult;
            if (actionResponse.flag == "1") {
                showErrorView(actionResponse.desc);
                return;
            } else {
                //请求数据接口
                try {
                    personList = actionResponse.servicecodesres.servicecoderes[0].resdata.struct[0].referlist.group[0].referinfo;
                } catch (e) {
                    personList = [];
                }
                if(personList.length != 0){
                    getSaleTargetsData();
                } else {
                    showNodata();
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            dismissProgressDialog();
            showErrorView(errorTip);
        }
    })
}

function getData() {
    showProgressDialog();
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
                        },{
                            "value": "0",
                            "@id": "startline"
                        },{
                            "value": "10000",
                            "@id": "count"
                        }]
                    }
                }]
            }
        }, {
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
            dismissProgressDialog();
            $.each(responseStr.wacomponents.wacomponent, function(index, wacomponent) {
                if (wacomponent.componentid == "WACRMOBJECT") {
                    conditions = JSON.parse(wacomponent.actions.action[0].resresult.servicecodesres.servicecoderes[0].resdata.struct[0].datavalue[0].value).list;
                    initTargetConditions();
                } else if (wacomponent.componentid == "WAASARCHIVEREF") {
                    var actionResponse = wacomponent.actions.action[0].resresult;
                    if (actionResponse.flag == "1") {
                        showErrorView(actionResponse.desc);
                        return;
                    }
                    try {
                        departments = (actionResponse.servicecodesres.servicecoderes[0].resdata.struct[0].referlist.group[0].referinfo);
                    } catch (e) {
                        departments = [];
                    }
                    initDepartment();
                    initDimensionContent();
                }
            });
            getSaleTargetsDataPrepare();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            dismissProgressDialog();
            showErrorView(errorTip);
        }
    })
}

function initDepartment() {
    $(".nav-list-04").empty();
    if (demensionIndex != 1) {
        return;
    }
    if (selectDepartment == undefined) {
        selectDepartment = [];
        $.each(departments, function(index, val) {
            selectDepartment[index] = val.referid;
        })
    }

    if (departments.length == 0) {
        //未获取到部门列表
        $(".nav-list-04").append("未获取到部门数据")
        return;
    }

    $(".nav-list-04").append("<p>全部<label><span class=\"icon-check\"></span></label></p>");
    var isFullEqual = true;
    $.each(departments, function(index, department) {
            var temp = selectDepartment.indexOf(department.referid);
            if (temp != -1) {
                $(".nav-list-04").append("<p>" + department.refername + "<label><span class=\"icon-check-on\"></span></label></p>");
                isFullEqual = isFullEqual && true;
            } else {
                $(".nav-list-04").append("<p>" + department.refername + "<label><span class=\"icon-check\"></span></label></p>");
                isFullEqual = isFullEqual && false;
            }
        })

    //删除没有的部门
    $.each(selectDepartment,function(index,val){
        if(getDepartmentById(val) == undefined){
            selectDepartment.splice(index,1);
        }
    })

    function getDepartmentById(referId){
        var temp = undefined;
        $.each(departments,function(index,department){
            if(department.referid == referId){
                temp = department;
                return;
            }
        })
        return temp;
    }
        //全选
    if (isFullEqual && selectDepartment.length >= departments.length) {
        $(".nav-list-04 p:eq(0) label span.icon-check").addClass("icon-check-on");
        $(".nav-list-04 p:eq(0) label span.icon-check-on").removeClass("icon-check");
    }

    $(".nav-list-04 p").each(function(index, content) {
        $(content).on('click', function() {
            if (index == 0) {
                //全部
                if (selectDepartment.length == departments.length) {
                    selectDepartment = [];
                    $(".nav-list-04 p").removeClass("active")
                    $(".nav-list-04 p").find("label span.icon-check-on").removeClass("icon-check-on");
                    $(".nav-list-04 p").find("label span").addClass("icon-check")
                } else {
                    selectDepartment = []
                    $.each(departments, function(index, val) {
                        selectDepartment[index] = val.referid;
                    })
                    $(".nav-list-04 p").addClass("active");
                    $(".nav-list-04 p").find("label span.icon-check").addClass("icon-check-on");
                }

            } else {

                var selectIndex = selectDepartment.indexOf(departments[index - 1].referid);
                if (selectIndex != -1) {
                    //去除全部
                    $(".nav-list-04 p:eq(0)").removeClass("active");
                    $(".nav-list-04 p:eq(0) label span").removeClass("icon-check-on");
                    $(".nav-list-04 p:eq(0) label span").addClass("icon-check");
                    selectDepartment.splice(selectIndex, 1);
                    $(this).removeClass("active");
                    $(this).find("label span").removeClass("icon-check-on")
                    $(this).find("label span").addClass("icon-check")
                } else {
                    selectDepartment[selectDepartment.length] = departments[index - 1].referid;
                    $(this).addClass("active");
                    $(this).find("label span").removeClass("icon-check")
                    $(this).find("label span").addClass("icon-check-on")
                }
                if (selectDepartment.length == departments.length) {
                    //是否手动选择了全部
                    $(".nav-list-04 p:eq(0)").addClass("active");
                    $(".nav-list-04 p:eq(0) label span").removeClass("icon-check");
                    $(".nav-list-04 p:eq(0) label span").addClass("icon-check-on");
                }
            }
        });
    });
}

function initTargetConditions() {

    $.each(conditions, function(index, condition) {
        if (condition.id == report_metric) {
            selectConditionName = condition.name;
            $(".nav-list-01").append("<p class=\"active\">" + condition.name + "</p>");
        } else {
            $(".nav-list-01").append("<p>" + condition.name + "</p>");
        }
    });
    if (report_metric == undefined) {
        $(".nav-list-01 p:eq(0)").addClass("active")
        selectConditionName = conditions[0].name;
        report_metric = conditions[0].id;
    }

    $(".nav-list-01 p").each(function(index, content) {
        $(content).on('click', function() {
            report_metric = conditions[index].id;
            $(".nav-list-01 p.active").removeClass("active");
            $(this).addClass("active")
            getSaleTargetsDataPrepare();
            hideSelectBar();
            $("#Metric").html(conditions[index].name + "<i class=\"icon-rowbottom\"></i>");
        });
    });
    $("#Metric").html(selectConditionName == undefined ? "指标" : selectConditionName + "<i class=\"icon-rowbottom\"></i>");
}

function initPeriodView() {
    if (periodIndex == undefined) {
        periodIndex = 0;
    }
    //初始化 类型
    $("#period_list li").each(function(index, content) {
        $(content).on("click", function() {
            $("#period_list li span").remove();
            $("#period_list li.active").removeClass("active");
            $(this).addClass("active");
            $(this).prepend("<span class=\"circle\"></span>");
            periodIndex = index;
            if (index != 0) {
                $("#period_content").hide();
                $("#period_content_year").show();
            } else {
                $("#period_content").show();
                $("#period_content_year").hide();
            }
            initPeriodTitle();
        })
    });

    function initPeriodTitle() {
        var title = "";
        if (periodIndex == 0) {
            title = title + "按周" + "/" + hanzi[report_period2 - 1] + "月";
        } else if (periodIndex == 1) {
            title = title + "按月";
            title = title + "/" + report_year + "年"
        } else if (periodIndex == 2) {
            title = title + "按季";
            title = title + "/" + report_year + "年"
        }

        $("#Period").html(title + "<i class=\"icon-rowbottom\"></i>");
    }
    $("#period_list li:eq(" + periodIndex + ")").addClass("active");
    $("#period_list li:eq(" + periodIndex + ")").prepend("<span class=\"circle\"></span>");
    if (periodIndex != 0) {
        $("#period_content").hide();
        $("#period_content_year").show();
    } else {
        $("#period_content").show();
        $("#period_content_year").hide();
    }

    //初始化 年
    var year = new Date().getFullYear();
    var years = [year - 1, year, year + 1];
    $(".nav-list-06").empty();
    $(".nav-list-06").append("<em class=\"row-left\"></em>")
    $.each(years, function(index, val) {
        var isSelect = false;
        if (report_year == undefined) {
            if (val == year) {
                isSelect = true
            }
        } else {
            if (val == report_year) {
                isSelect = true;
            }
        }
        if (isSelect) {
            $(".nav-list-06").append("<p class=\"active\">" + val + "年</p>")
            $(".nav-list-07").append("<p class=\"active\">" + val + "年</p>")
        } else {
            $(".nav-list-06").append("<p>" + val + "年</p>")
            $(".nav-list-07").append("<p>" + val + "年</p>")
        }

        $(".nav-list-06 p").each(function(index, content) {
            $(content).on("click", function() {
                $(".nav-list-07 p.active").removeClass("active");
                $(".nav-list-06 p.active").removeClass("active");
                $(this).addClass("active");
                $(".nav-list-07 p:eq(" + index + ")").addClass("active");
                report_year = years[index];
                needReload = true;
                initPeriodTitle()
            })
        })
        $(".nav-list-07 p").each(function(index, content) {
            $(content).on("click", function() {
                $(".nav-list-07 p.active").removeClass("active");
                $(".nav-list-06 p.active").removeClass("active");
                $(this).addClass("active");
                $(".nav-list-06 p:eq(" + index + ")").addClass("active");
                report_year = years[index];
                needReload = true;
                initPeriodTitle()
                hideSelectBar();
                getSaleTargetsDataPrepare();
            })
        })

    });

    if (report_year == undefined) {
        report_year = year;
    }

    if (report_period2 == undefined) {
        var month = new Date().getMonth() + 1;
        report_period2 = month;
    }

    $(".nav-list-03 p:eq(" + (report_period2 - 1) + ")").addClass("active")
    $(".nav-list-03 p").each(function(index, content) {
        $(content).on("click", function() {
            $(".nav-list-03 p.active").removeClass("active");
            $(this).addClass("active");
            report_period2 = index + 1;
            getSaleTargetsDataPrepare();
            hideSelectBar();
            initPeriodTitle();
        })
    })
    initPeriodTitle();
}

function initData(dataList) {
    $(".clerk").empty();
    var select = 0;
    var index = 0;
    targetData = [];
    for (var userId in dataList) {
        var userData = new Object();
        var data = dataList[userId];
        var name = data.demensionName;
        $(".clerk").append("<li " + (select == index ? "class=\"active\"" : "") + "><a href=\"#\">" + name + "</a></li>");
        index++;
        userData.userId = userId;
        userData.name = name;
        var max = 0;
        var list = []
        var i = 0;
        var temp;
        var memberIndex = 0;
        for (var member in data) {
            if (member == "demensionName") {
                memberIndex++;
                continue;
            }

            if (i == 0) {
                temp = new Object();
                temp.realval = data[member]
                if (max < data[member]) {
                    max = data[member];
                }
                i++;
            } else if (i == 1) {
                temp.targetval = data[member]
                if (max < data[member]) {
                    max = data[member];
                }
                i++;
            } else if (i == 2) {
                temp.diff = data[member]
                i++;
            } else if (i == 3) {
                temp.rate = data[member]
                i = 0;
                list[list.length] = temp;
            }
            memberIndex++;
        }
        userData.data = list;
        userData.max = max;
        targetData[targetData.length] = userData;
    }

    $(".clerk li a").each(function(index, content) {
        console.log("clerk width = " + $(content).outerWidth());

        $(content).on("click", function() {
            $(".clerk li.active").removeClass("active");
            $($(this).parent()).addClass("active");
            showProgressDialog();
            initDataContent(targetData[index]);
            setInterval(function() {
                dismissProgressDialog();
            }, 400);

        })
    })

    var wh = 0;
    $(".clerk li").each(function(index,content){
        wh += $(content).outerWidth() + 10;
    })
    var w = $(window).width();
    $('.clerk').width(wh + 20 <= w ? w - 20: wh);
    $('.clerk').hide();
    $('.clerk').show();
    $('.clerk').scrollLeft = 0;
    // var y = 0;
    // var lt = wh - w;
    // $(".clerk").swipe({
    //     swipeLeft: function() {
    //         if (lt > 0) {
    //             if ((y - 40) <= -lt) {
    //                 var t = -lt + "px";
    //                 $(this).css({
    //                     'transform': "translate(" + t + ")",
    //                     'transition-duration': '600ms',
    //                     'transition-timing-function': 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    //                 });
    //             } else {
    //                 y = y - 40;
    //                 var t = y + "px";
    //                 $(this).css({
    //                     'transform': "translate(" + t + ")",
    //                     'transition-duration': '600ms',
    //                     'transition-timing-function': 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    //                 });
    //             }
    //         }
    //
    //     },
    //     swipeRight: function() {
    //         if (lt > 0) {
    //             if (y == 0) {
    //                 $(this).css({
    //                     'transform': "0",
    //                     'transition-duration': '600ms',
    //                     'transition-timing-function': 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    //                 });
    //             } else {
    //                 y = y + 40;
    //                 var t = y + "px";
    //                 $(this).css({
    //                     'transform': "translate(" + t + ")",
    //                     'transition-duration': '600ms',
    //                     'transition-timing-function': 'cubic-bezier(0.1, 0.57, 0.1, 1)'
    //                 });
    //             }
    //         }
    //
    //     }
    // });

    //初始化下方表
    var target = targetData[select];
    initDataContent(target);

}

function initDataContent(target) {
    $(".target-title span").empty();
    $(".target-list ul").empty();
    if (target == undefined) {
        showNodata();
        return;
    }
    hideNodata();
    $(".target-title span").empty();
    $(".target-title span").text(target.name.length > 12 ? target.name.substr(0, 12) + "..." : target.name);
    $(".target-list ul").empty();

    function formatData(data) {
        if (selectConditionName != undefined) {
            if (report_metric == "1" || report_metric == "2" || report_metric == "3") {
                return fmoney(data);
            } else {
                return data;
            }
        } else {
            return data;
        }
    }
    $.each(target.data, function(index, val) {

        //不是100的原因是为了给右边的数字腾出空间
        //+2 原因是为了柱状图有一点点
        var realValPercent = target.max == 0 ? 2 : val.realval * 68 / target.max + 2;
        var targetValPercent = target.max == 0 ? 2 :val.targetval * 68 / target.max + 2;
        $(".target-list ul").append("<li>" +
            "<h5>" + getDataTitle(index) + "</h5>" +
            "<div class=\"target-01\">差异<span>" + formatData(val.diff) + "</span>完成率<em>" + val.rate + "</em></div>" +
            "<div class=\"progress\">" +
            "<div class=\"progress-bar first\" role=\"progressbar\" aria-valuenow=\"60\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:" + realValPercent + "%;\">" +
            "</div><span>" + formatData(val.realval) + "</span>" +
            "</div>" +
            "<div class=\"progress\">" +
            "<div class=\"progress-bar second\" role=\"progressbar\" aria-valuenow=\"34\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:" + targetValPercent + "%;\">" +
            "</div><span>" + formatData(val.targetval) + "</span>" +
            "</div>" +
            "</li>");

        function getDataTitle(index) {
            if(target.data.length - 1 == index){
                return "合计";
            }
            var title = report_year + "年";
            if (periodIndex == 0) {
                title = title + hanzi[report_period2 - 1] + "月" + "第" + hanzi[index] + "周";
            } else if (periodIndex == 1) {
                title = title + hanzi[index] + "月";
            } else if (periodIndex == 2) {
                title = title + "第" + hanzi[index] + "季度"
            }
            return title;
        }
    })
}

function hideSelectBar() {
    $(".mask").hide();
    $(".navbar a").removeClass("active");
    $(".mask-content").find("ol").removeClass("block");
    barShowIndex = undefined;
}

function showNodata(){
    $(".clerk").empty();
    $(".target-title span").empty();
    $(".target-list ul").empty();
    $(".nodata").show();
}

function hideNodata(){
    $(".nodata").hide();
}

function showErrorView(tip){
    hideNodata();
    clickable = false;
    $(".tip p").text(tip)
    $(".tip").show();
    $(".target-title span").empty();
    $(".target-list ul").empty();
    $(".clerk").empty();
}

function saveSelect() {
    window.localStorage.setItem(key + "report_year", report_year);
    window.localStorage.setItem(key + "demensionIndex", demensionIndex);
    window.localStorage.setItem(key + "report_dept", report_dept);
    window.localStorage.setItem(key + "report_metric", report_metric);
    window.localStorage.setItem(key + "report_person", report_person);
    window.localStorage.setItem(key + "report_year", report_year);
    window.localStorage.setItem(key + "report_period", report_period);
    window.localStorage.setItem(key + "report_period2", report_period2);
    window.localStorage.setItem(key + "periodIndex", periodIndex);
    window.localStorage.setItem(key + "selectDepartment", JSON.stringify(selectDepartment));
}
