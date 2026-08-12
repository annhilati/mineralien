let TinySDF;
import('@mapbox/tiny-sdf').then(m => {
    TinySDF = m.default || m;
    const sdf = new TinySDF({
        fontSize: 24,
        fontFamily: "sans-serif",
        buffer: 3,
        radius: 8,
        cutoff: 0.25
    });
    const result = sdf.draw('A');
    console.log(JSON.stringify({
        width: result.width,
        height: result.height,
        glyphWidth: result.glyphWidth,
        glyphHeight: result.glyphHeight,
        glyphLeft: result.glyphLeft,
        glyphTop: result.glyphTop,
        glyphAdvance: result.glyphAdvance
    }, null, 2));
});
