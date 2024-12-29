const GROUP_TYPES = require('../constants/groupTypes');

const groupTypeUtils = {
    getGroupLabel: (id) => {
        const group = Object.values(GROUP_TYPES).find(g => g.id === parseInt(id));
        return group ? group.label : 'Unknown';
    },

    isValidGroupType: (id) => {
        return Object.values(GROUP_TYPES).some(g => g.id === parseInt(id));
    }
};

module.exports = groupTypeUtils; 