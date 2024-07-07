import { _ } from '../../i18n.js';

export function getOption(id, name, solves, challenges) {
    let breakdown = {};

    challenges.forEach(({ category }) => {
        breakdown[category] = 0;
    });

    solves.forEach((solve) => {
        const category = solve.challenge.category;
        const point = solve.challenge.value;
        if (category in breakdown) {
            breakdown[category] += point;
        } else {
            breakdown[category] = point;
        }
    });

    const max = Math.max(...Object.values(breakdown));

    return {
        radar: {
            indicator: Object.keys(breakdown).map(name => ({ name, max })),
        },
        tooltip: {
            show: true,
        },
        series: [
            {
                name: _('Category breakdown'),
                type: 'radar',
                data: [
                    {
                        value: Object.values(breakdown),
                    }
                ]
            }
        ]
    };

}