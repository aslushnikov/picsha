(function (d, w, c) {
    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter21348973 = new Ya.Metrika({id:21348973,
                webvisor:true,
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                trackHash:true});
        } catch(e) { }
    });

    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
})(document, window, "yandex_metrika_callbacks");