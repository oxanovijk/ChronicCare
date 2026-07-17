module.exports = [
"[project]/src/lib/db/client.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[externals]__0x3z63u._.js",
  "server/chunks/ssr/[root-of-the-server]__0fj-hzh._.js",
  "server/chunks/ssr/[root-of-the-server]__1mvqgia._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/db/client.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/node_modules/next/headers.js [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
    });
});
}),
];