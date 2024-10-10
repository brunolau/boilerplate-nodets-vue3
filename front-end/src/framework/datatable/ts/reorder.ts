//Based on https://github.com/loonywizard/native-js-dnd-list by Vladimir Nikitin
import "./../css/reorder.css";

const DRAG_THRESHOLD = 4;
const CLICK_THRESHOLD = 550;
const DURATION_OF_DRAGGING_ITEM_ANIMATION = 200;

let isMouseDown = false;
let isDragging = false;
let draggingItem = null;
let draggingHasStarted = false;
let mouseOffsetX = null;
let mouseOffsetY = null;
let hasLastAnimationCompleted = true;
let startX = null;
let startY = null;
let wasDragged = false;
let onReorder = null;
let onClick = null;
var timeStart = null;

function getDOMNodePosition(node) {
    return {
        top: node.offsetTop,
        left: node.offsetLeft,
    };
}

function swapTwoDOMNodes(node1, node2) {
    if (node1.nextElementSibling === node2) {
        node1.parentNode.insertBefore(node2, node1);
    } else if (node2.nextElementSibling === node1) {
        node1.parentNode.insertBefore(node1, node2);
    }
}

function startDraggingHandler(event) {
    mouseOffsetX = event.pageX - getDOMNodePosition(draggingItem).left;
    mouseOffsetY = event.pageY - getDOMNodePosition(draggingItem).top;
}

function stopDraggingHandler() {
    draggingItem.classList.add("dt-animated-draggable-item");
    hasLastAnimationCompleted = false;

    setTimeout(() => {
        draggingItem.classList.remove("dt-draggable");
        draggingItem.classList.remove("dt-draggable-start");
        draggingItem.classList.remove("dt-animated-draggable-item");
        hasLastAnimationCompleted = true;
        draggingItem = null;
    }, DURATION_OF_DRAGGING_ITEM_ANIMATION);
}

function handleDragging(event) {
    if (!draggingHasStarted) {
        draggingItem.classList.add("dt-draggable-start");
        startY = event.pageY;
        startX = event.pageX;
        startDraggingHandler(event);
        draggingHasStarted = true;
    }

    if (Math.abs(startY - event.pageY) > DRAG_THRESHOLD || Math.abs(startX - event.pageX) > DRAG_THRESHOLD) {
        wasDragged = true;
        draggingItem.classList.add("dt-draggable");
    }

    draggingItem.style.top = `${event.pageY - mouseOffsetY}px`;
    draggingItem.style.left = `${event.pageX - mouseOffsetX}px`;

    console.log(event.pageX);

    const draggingItemCoordinates = getDOMNodePosition(draggingItem);
    const prevItem = draggingItem.previousElementSibling;
    const nextItem = draggingItem.nextElementSibling;

    if (prevItem) {
        const prevItemCoordinates = getDOMNodePosition(prevItem);
        const shouldSwapItems = draggingItemCoordinates.left + draggingItem.offsetWidth / 2 < prevItemCoordinates.left + prevItem.offsetWidth / 2;

        if (shouldSwapItems && wasDragged) {
            swapTwoDOMNodes(draggingItem, prevItem);
            return;
        }
    }

    if (nextItem) {
        const nextItemCoodridanes = getDOMNodePosition(nextItem);
        const shouldSwapItems = draggingItemCoordinates.left + draggingItem.offsetWidth / 2 > nextItemCoodridanes.left + nextItem.offsetWidth / 2;

        if (shouldSwapItems && wasDragged) {
            swapTwoDOMNodes(draggingItem, nextItem);
        }
    }
}

function raiseOnReorderedEvent() {
    var sortOrder = [];
    if (draggingItem == null) {
        return;
    }

    draggingItem.parentNode.childNodes.forEach((colHeader, i) => {
        sortOrder.push(colHeader.getAttribute("data-col-id"));
    });

    var ord = onReorder;
    setTimeout(function () {
        ord(sortOrder);
    }, 100);
}

function raiseOnClickedEvent() {
    var now = new Date().getTime();
    if (now - timeStart < CLICK_THRESHOLD) {
        onClick();
    }
}

function onMouseUp() {
    if (draggingItem && isDragging) {
        stopDraggingHandler();
    }
    isMouseDown = false;
    isDragging = false;
    draggingHasStarted = false;
    mouseOffsetX = null;
    mouseOffsetY = null;

    if (wasDragged) {
        raiseOnReorderedEvent();
    } else {
        raiseOnClickedEvent();
    }

    onClick = null;
    onReorder = null;
}

function onMouseMove(event) {
    isDragging = isMouseDown;
    if (isDragging) {
        handleDragging(event);
    }
}

if (!portalUtils.treatAsMobileDevice()) {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
    });
} else {
    document.addEventListener("touchend", onMouseUp);
    document.addEventListener("touchmove", (event) => {
        onMouseMove(event);
    });
}

export default class ReorderProvider {
    static handleMouseDown(e, onReorderHandler, onClickHandler) {
        if (e.which == 2 || e.which == 3) {
            return;
        }

        if (hasLastAnimationCompleted) {
            startX = null;
            startY = null;
            wasDragged = false;
            draggingItem = e.target;
            isMouseDown = true;
            timeStart = new Date().getTime();
            onClick = onClickHandler;
            onReorder = onReorderHandler;
        }
    }
}
