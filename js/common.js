function sendWARequest(request) {
    var wacomponents = new Object();
    wacomponents = {
        wacomponents: {
            session: {
                session: request.session,
                id: request.session
            },
            wacomponent: request.wacomponent
        }
    };
    $.ajax({
        type: "POST",
        contentType: "application/json",
        headers: {
            'compresstype': '1',
            'translatetype': 'json',
            'translateversion': '1.1',
            'compress': 'N',
            'contaiver': 'N',
            'encryption': 'N',
            'encryptiontype': 1
        },
        data: JSON.stringify(wacomponents),
        url: request.waUrl,
        beforeSend: request.beforeSend,
        success: request.success,
        error: request.error
    });
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null)
        return unescape(r[2]);
    return ""; //返回参数值
}

function fmoney(s, n) {
    if(isNaN(s) || s == ""){
        return s;
    }
    var start = "";
    if(s < 0 ){
        s = Math.abs(s);
        start = "-";
    }
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return start + t.split("").reverse().join("") + "." + r;
}
