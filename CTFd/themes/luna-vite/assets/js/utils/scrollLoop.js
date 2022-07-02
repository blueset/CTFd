export const itemHeight = 100;

function setScrollOffset(node, val) {
    node.scrollTop += val;
}

export function scrollUpdate() {
    if (performance.now() - window.lastClick < 500) return;

    const listNode = document.getElementById("challengesList");
    const centerNodes = [...document.querySelectorAll("[data-is-center]")];
    const centerTop = Math.min(...centerNodes.map((v) => v.offsetTop));
    const centerBottom = Math.max(
        ...centerNodes.map((v) => v.offsetTop + v.offsetHeight)
    );
    const viewTop = listNode.scrollTop;
    const viewBottom = listNode.scrollTop + listNode.clientHeight;
    const viewHeight = listNode.clientHeight;
    const centerHeight = itemHeight * centerNodes.length;

    if (viewBottom <= centerTop) {
        // console.log(
        //     `Condition: ${centerTop} ~ ${centerBottom} overlaps ${viewTop} ~ ${viewBottom}: ${(viewTop <= centerTop && centerTop <= viewBottom) ||
        //     (viewTop <= centerBottom && centerBottom <= viewBottom) ||
        //     (centerTop <= viewTop && viewBottom <= centerBottom)
        //     }`
        // );
        // console.log(
        //     `above: ${listNode.scrollTop} += ${Math.ceil((centerTop - viewBottom + viewHeight) / centerHeight) *
        //     centerHeight
        //     }`
        // );
        setScrollOffset(
            listNode,
            +Math.ceil((centerTop - viewBottom + viewHeight) / centerHeight) *
            centerHeight
        );
    } else if (viewTop >= centerBottom) {
        // console.log(
        //     `Condition: ${centerTop} ~ ${centerBottom} overlaps ${viewTop} ~ ${viewBottom}: ${(viewTop <= centerTop && centerTop <= viewBottom) ||
        //     (viewTop <= centerBottom && centerBottom <= viewBottom) ||
        //     (centerTop <= viewTop && viewBottom <= centerBottom)
        //     }`
        // );
        // console.log(
        //     `below: ${listNode.scrollTop} -= ${Math.ceil((viewTop - centerTop + viewHeight) / centerHeight - 1) *
        //     centerHeight
        //     }`
        // );
        setScrollOffset(
            listNode,
            -Math.ceil((viewTop - centerTop + viewHeight) / centerHeight - 1) *
            centerHeight
        );
    }
}

const isWinGecko = !!/Windows NT .* rv:([^\)]+)\) Gecko\/\d{8}/.test(navigator.userAgent);

if (isWinGecko) {
    scrollUpdate = _.debounce(scrollUpdate, 150);
}
