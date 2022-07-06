export const itemHeight = 100;

function setScrollOffset(node, val) {
    node.scrollTop += val;
}

export function scrollUpdate() {
    if (performance.now() - window.lastClick < 500) return;

    const listNode = document.getElementById("challengesList");
    const centerNodes = [...document.querySelectorAll("[data-is-center]")];
    var centerProbe = centerNodes;
    if (document.querySelectorAll(".challengeItem.selected").length) {
      centerProbe = [...document.querySelectorAll(".challengeItem.selected")];
    }
    const centerTop = Math.min(...centerNodes.map((v) => v.offsetTop));
    const centerBottom = Math.max(
      ...centerNodes.map((v) => v.offsetTop + v.offsetHeight)
    );
    const probeTop = Math.min(...centerProbe.map((v) => v.offsetTop));
    const probeBottom = Math.max(
      ...centerProbe.map((v) => v.offsetTop + v.offsetHeight)
    );
    const viewTop = listNode.scrollTop;
    const viewBottom = listNode.scrollTop + listNode.clientHeight;
    const viewHeight = listNode.clientHeight;
    const centerHeight = itemHeight * centerNodes.length;

    if (centerTop <= viewTop && viewBottom <= centerBottom) return;
    
    if (viewBottom <= probeTop) {
        setScrollOffset(
          listNode,
          +Math.max(Math.ceil((probeTop - viewBottom + viewHeight) / centerHeight - 1), 1) *
            centerHeight
        );
    } else if (viewTop >= probeBottom) {
        setScrollOffset(
          listNode,
          -Math.max(Math.ceil((viewTop - probeTop + viewHeight) / centerHeight - 1), 1) *
            centerHeight
        );
    }
}

const isWinGecko = !!/Windows NT .* rv:([^\)]+)\) Gecko\/\d{8}/.test(navigator.userAgent);

if (isWinGecko) {
    scrollUpdate = _.debounce(scrollUpdate, 150);
}
