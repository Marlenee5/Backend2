function logger(req, res, next) {
    const start = Date.now();
    console.log(`[START] ${req.method} ${req.originUrl}`);

    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[END] ${req.method} ${req.originUrl} | Status: ${res.statusCode} | Tiempo (ms): ${ms} ms `)
    });

    next();
}

export default logger;