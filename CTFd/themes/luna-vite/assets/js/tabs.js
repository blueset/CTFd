import { resize } from "./utils/graphs/echarts";

export function initTabs(tabNodes, tabContentNodes) {
    Object.keys(tabNodes).forEach(tabId => {
        const tabNode = tabNodes[tabId];
        const tabContentNode = tabContentNodes[tabId];
        tabNode.addEventListener('click', () => {
            Object.values(tabNodes).forEach(tabNode => {
                tabNode.classList.remove('active');
            });
            Object.values(tabContentNodes).forEach(tabContentNode => {
                tabContentNode.classList.add('hidden');
            });
            tabNode.classList.add('active');
            tabContentNode.classList.remove('hidden');

            // Resize graphs
            let graphs = document.querySelectorAll("[_echarts_instance_]");
            if (graphs.length > 0) {
                graphs.forEach(graph => resize(graph));
            }
        });
    });
}

export default function TabPageInit() {
    const tabNodes = [...document.querySelectorAll('#tabbedView .tab')]
        .reduce((obj, cur) => ({...obj, [cur.dataset.target]: cur}), {});
    const tabContentNodes = [...document.querySelectorAll('.tabPane')]
        .reduce((obj, cur) => ({...obj, [cur.id]: cur}), {});
    if (Object.keys(tabNodes).length > 0) {
        initTabs(tabNodes, tabContentNodes);
    }
}