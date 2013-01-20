
(function(exports, ss, $, undefined) {

    var defaultConfig = {
        columnsCount: 3,
        columnClassSel: '.column',
        sortables: '.meta-box-sortables',
        sortablesConfig: {
            placeholder: 'sortable-placeholder',
            connectWith: '.meta-box-sortables',
            items: '.widget',
            handle: '.widget-head',
            cursor: 'move',
            delay: 100,
            distance: 2,
            tolerance: 'pointer',
            forcePlaceholderSize: true,
            helper: 'clone',
            opacity: 0.65,
        }

    };

    //Private functions
    function _build() {
        var htmlBase = ss.tmpl['dashboard-dashboard'].render({id: this.id});
        this.container.html(htmlBase);
        this.setColumnsCount(this.config.columnsCount);
    }

    function _markArea() {
        var self = this;
        $('#'+this.id+' '+this.config.sortables+':visible').each(function(n, el) {
            var t = $(this);
            t.removeClass('empty-placeholder');
            if (t.children(self.config.sortablesConfig.items+':visible').length > 0) {
                t.removeClass('empty-container');
            } else {
                t.addClass('empty-container');
            }
        });
    }

    function _selectableOnStart(self, e, ui) {
        $('#'+self.id+' '+self.config.sortables+':visible').each(function(n, el) {
            $('<div></div>')
                .appendTo($(this))
                .addClass('empty-placeholder')
                .height($(ui.helper).height());
        });
    }

    function _selectableOnStop(self, e, ui) {
        $('#'+self.id+' '+self.config.sortables+':visible .empty-placeholder').remove();
        $('#'+self.id+' '+self.config.columnClassSel).removeClass('drag-over');
    }

    function _selectableOnOver(self, e, ui) {
        if (!$(e.target.parentElement).hasClass('drag-over')) {
            var t = $('#'+self.id+' .drag-over '+self.config.sortables);
            if (t.length === 1) {
                $('<div></div>')
                    .appendTo(t)
                    .addClass('empty-placeholder')
                    .height($(ui.helper).height());
            }
            $('#'+self.id+' '+self.config.columnClassSel).removeClass('drag-over');
            $(e.target.parentElement).addClass('drag-over');
            $('.empty-placeholder', e.target.parentElement).remove();
        }
    }

    function _columnFindNextFree() {
        var
            result = $('#'+this.id+' #column-1'),
            resultCount = result.length,
            self = this;
        $('#'+this.id+' > '+this.config.columnClassSel).each(function(n, v) {
            var c = $(self.config.sortablesConfig.items, v).length;
            if (resultCount > c) {
                resultCount = c;
                result = $(v);
            }
        });

        return result;
    }

    function _loadWidgetModule(name, cbs) {
        var moduleCN = '/dashboard/widgets/' + name;
        if (ss.app.isModuleLoaded(moduleCN)) {
            var moduleConfig = ss.app.getModuleConfig(moduleCN);
            cbs.beforeLoad(moduleConfig);
            return cbs.afterLoad(moduleConfig);
        }
        ss.app.loadModule(moduleCN, cbs);
    }

    function _configure(container, id, conf) {
        this.id = id;
        this.container = container;
        this.config = $.extend(true, {}, defaultConfig);
        this.config = $.extend(true, this.config, conf);
    }

    //Constructor
    function Dashboard(container, id, conf) {
        _configure.call(this, container, id, conf || {});
        _build.call(this);
    }

    //Public functions
    Dashboard.prototype.setColumnsCount = function(colCount) {
        var
            did = this.id,
            colSelector = '#'+did+' > '+this.config.columnClassSel,
            c = $(colSelector).length;
        if (c !== colCount && colCount > 0 && colCount < 5) {
            var addColumn = function() {
                var html = ss.tmpl['dashboard-column'].render({
                    number: ++c,
                });
                $(html).appendTo('#'+did);
            };

            var removeColumn = function() {
                c--;
                var col = $(colSelector+':last');
                col.remove();
            };

            while (c < colCount) {
                addColumn();
            }
            while (c > colCount) {
                removeColumn();
            }
            $('#'+did).removeClass (function (index, css) {
                return (css.match (/\bcolumns-\S+/g) || []).join(' ');
            });
            $('#'+did).addClass('columns-'+colCount);
            this.config.columnsCount = colCount;

            this.update();
        }
    };

    Dashboard.prototype.update = function() {
        var self, config;
        self = this;
        config = $.extend(this.config.sortablesConfig, {
            start: function (e,ui) {
                return _selectableOnStart.call(this, self, e, ui);
            },
            stop: function (e,ui) {
                return _selectableOnStop.call(this, self, e, ui);
            },
            over: function (e, ui) {
                return _selectableOnOver.call(this, self, e, ui);
            },
            out: function (e, ui) {

            },
            receive: function(e,ui) {
                _markArea.call(self);
            }
        });
        $('#'+this.id+' '+this.config.sortables).sortable(config);

        _markArea.call(this);
    };

    Dashboard.prototype.addWidget = function(name, cb) {
        var self, widgetContainer;
        self = this;
        _loadWidgetModule.call(this, name, {
            beforeLoad: function(moduleConfig) {
                var num = $('#'+self.id+' '+self.config.sortablesConfig.items).length + 1;
                var opt = $.extend(
                    {
                        'id': 'wbox-' + name + '-' + num,
                        'class': 'wbox-' + name,
                        'caption': 'Widget ' + num,
                        'content': '...'
                    },
                    moduleConfig.widget || {}
                );
                var html = ss.tmpl['dashboard-widget'].render(opt);
                var col = _columnFindNextFree.call(self);
                var widgetFrame = $(html).appendTo($(self.config.sortables, col));
                widgetContainer = $('.widget-content', widgetFrame);
                self.update();
            },
            afterLoad: function(moduleConfig) {
                ss.app.createModuleInstance(moduleConfig.cs, widgetContainer, function(widgetInstance) {
                    self.update();
                    return cb(widgetInstance);
                });
            }
        });
    };

    exports.factory = Dashboard;

}(typeof exports === 'undefined' ? window : exports, ss, jQuery));
