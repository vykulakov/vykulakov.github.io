function getYmid() {
    try {
        return new URL(location.href).searchParams.get('ymid');
    } catch (e) {
        console.warn(e);
    }
    return null;
}

function getVar() {
    try {
        return new URL(location.href).searchParams.get('var');
    } catch (e) {
        console.warn(e);
    }
    return null;
}

function getVar3() {
    try {
        return new URL(location.href).searchParams.get('var_3');
    } catch (e) {
        console.warn(e);
    }
    return null;
}

self.options = {
    "domain": "bigrourg.net",
    "resubscribeOnInstall": true,
    "zoneId": 4476686,
    "ymid": getYmid(),
    "var": getVar(),
    "var_3": getVar3()
}
self.lary = "";
importScripts('https://bigrourg.net/pfe/current/sw.perm.check.min.js?r=sw');