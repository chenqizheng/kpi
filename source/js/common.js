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
