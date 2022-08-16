const BackgroundCanvasResources = {
    canvas: null,
    iconWall: null,
};

function drawPatternScale(ctx, img, startx, starty, width, height, scale) {
    ctx.scale(scale, scale);

    const triangularPattern = ctx.createPattern(img, "repeat");
    ctx.fillStyle = triangularPattern;
    ctx.fillRect(startx / scale, starty / scale, width / scale, height / scale);

    ctx.restore();
}

function render(timer) {
    timer = (timer / 30) % 580;
    const {canvas, iconWall} = BackgroundCanvasResources;
    if (canvas && iconWall) {
        const ctx = canvas.getContext("2d");
        ctx.save();
        const w = canvas.width,
            h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        const rad50 = 0.872665;
        const rad40 = Math.PI / 2 - rad50;
        ctx.rotate(rad50);
        const a1 = w * Math.cos(rad40),
            a2 = h * Math.cos(rad50),
            b1 = h * Math.cos(rad40),
            b2 = w * Math.cos(rad50);
        ctx.translate(0, -timer);
        drawPatternScale(ctx, iconWall, 0, -a1, b1 + b2, a1 + a2 + 580, 0.5);

        //ctx.font = "20px sans-serif";
        //ctx.fillText(`Timer: ${timer}`, 10, 50);
    }
    return window.requestAnimationFrame(render);
}

export default function IconWallCanvasInit() {
    const container = document.querySelector(".triangleContainer");
    if (!container || container.classList.contains("page-challenges-listing")) {
        return;
    }
    var canvas = document.getElementById("iconWallCanvas");
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "iconWallCanvas";
        canvas.classList.add("iconWallCanvas");
        container.insertBefore( canvas, container.firstChild);
    }
    const iconWall = new Image();
    iconWall.src = /(?:")(.+)(?=")/g.exec(getComputedStyle(document.documentElement).getPropertyValue("--icon-wall"))[1];

    BackgroundCanvasResources.canvas = canvas;
    BackgroundCanvasResources.iconWall = iconWall;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    window.requestAnimationFrame(render);

}