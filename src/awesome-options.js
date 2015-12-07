(function () {
    'use strict';

    class awesomeOptions {
        constructor() {
            // pagination options
            this.paginationPrev = '«';
            this.paginationNext = '»';
            this.pageSize       = 10;
            this.chomp          = false;
        }

        setPaginationPrev(prev) {
            this.paginationPrev = prev;
        }

        setPaginationNext(next) {
            this.paginationNext = next;
        }

        setDefaultPageSize(pageSize) {
            this.pageSize = parseInt(pageSize);
        }

        setDefaultChomp(chomp) {
            if (chomp !== false) chomp = parseInt(chomp);
            this.chomp = chomp;
        }

        $get() {
            let props = {};
            for (let key in this) {
                if (!this.hasOwnProperty(key)) continue;
                props[key] = this[key];
            }

            return props;
        }
    }

    angular
        .module('awesomeList')
        .provider('awesomeOptions', awesomeOptions);
})();
