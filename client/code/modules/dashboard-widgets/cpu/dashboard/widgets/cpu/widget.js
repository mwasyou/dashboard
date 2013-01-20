
(function(exports, ss, $, undefined) {

    //Private functions
    function _configure(container, id, conf) {
        this.id = id;
        this.container = container;
        this.timerCPULoad = null;
        this.cpuCount = 0;
        this.cpuPlots = {};
    }

    function _makeCPUPlot(container, num) {
        var plot = $.plot(container, [{
                data: _shiftPlotData(container),
                color: '#6CC5E0',
                lines: {
                    fill: true,
                    fillColor: { colors: [ { opacity: 0.5 }, { opacity: 0.1 } ] },
                    lineWidth: 1,
                },
                shadowSize: 0,
            }], {
            grid: {
                borderWidth: 1,
                minBorderMargin: 4,
                labelMargin: 3,
                borderColor: '#adadad',
                backgroundColor: {
                    colors: ["#fff", "#e4f4f4"]
                },
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                hoverable: false,
            },
            xaxis: {
                show: false,
                reserveSpace: false,
                labelHeight: 0,
            },
            yaxis: {
                show: true,
                min: 0,
                max: 100,
                color: "#9b9b9b",
                tickColor: "rgba(0, 0, 0, 0.1)",
            },
            legend: {
                show: false
            }
        });
        return plot;
    }

    function _shiftPlotData(container, plot, value) {
        var w, s, d, i, offset;
        w = container !== null ? container.width() / 2 : plot.width() / 2;
        s = plot ? plot.getData() : null;
        d = s === null ? [] : s[0].data;
        if (s !== null && typeof value !== "undefined") {
            d = d.slice(1);
            d.push([d.length, value < 0 ? 0 : value > 100 ? 100 : value]);
            i = 0;
            while (i < d.length) {
                d[i][0] = i;
                i++;
            }
        }
        //Shrink new data
        d.splice(0, d.length - w);
        offset = d.length;
        i = d.length;
        while (i < w) {
            d.push([i, 0]);
            i++;
        }
        //Shift old data
        i = offset - 1;
        while (i >= 0) {
            d[i+d.length-offset][1] = d[i][1];
            i--;
        }
        if (s !== null) {
            s[0].data = d;
            plot.setData(s);
        }
        return d;
    }

    function _resizeCPUFrames() {
        $('#'+this.id+' .wcpu-graph').each(function() {
            $(this).height($(this).width());
        });
        for (var plot in this.cpuPlots) {
            this.cpuPlots[plot].resize();
            this.cpuPlots[plot].setupGrid();
            this.cpuPlots[plot].draw();
        }
        $('#'+this.id+' .wcpu-total .progress').height($('#'+this.id+' .wcpu-frames').height() - $('#'+this.id+' .wcpu-total > h6').height() - 10);
    }

    function _updateCPULoadGrid() {
        var self = this, i, n, y, plot, plotSeries;
        if (this.timerCPULoad !== null) {
            clearTimeout(this.timerCPULoad);
            this.timerCPULoad = null;
        }
        ss.rpc('dashboard.widgets.cpu.getCPULoad', function(data) {
            if (typeof data === "object" && data.ready) {
                //CPU Load (total): data.used
                $('#'+self.id+'-total-pb')
                    .attr('data-percentage', data.used)
                    .progressbar({
                        transition_delay: 0,
                        refresh_speed: 0,
                        display_text: 0,
                    });
                $('#'+self.id+'-total-lb').html(data.used+'%');
                for (var cpu in data.detail.used) {
                    y = data.detail.used[cpu];
                    n = parseInt(cpu, 10) + 1;
                    $('#'+self.id+' .used-'+n).html('('+y+'%)');
                    plot = self.cpuPlots[n];
                    _shiftPlotData.call(self, null, plot, y);
                    plot.draw();
                }
            }
            this.timerCPULoad = setTimeout(function() {
                _updateCPULoadGrid.call(self);
            }, 1000);
        });
    }

    function _buildCPULoadGrid(framesContainer, cb) {
        var htmlFrame, self = this;
        ss.rpc('dashboard.widgets.cpu.getCPUCount', function(cpuCount) {
            var cols = 1, count = 1, rowfluid, frameclass;
            frameclass = 'span12';
            if (cpuCount > 1) {
                cols = 2;
                frameclass = 'span6';
            }
            if (cols > 1 && framesContainer.width() > 500) {
                cols = 4;
                frameclass = 'span3';
            }
            for (var row = 1; row <= Math.ceil(cpuCount / cols); row++) {
                rowfluid = $('<div class="row-fluid"></div>').appendTo(framesContainer);
                for (var col = 1; col <= cols; col++) {
                    var cpuNum = count++;
                    htmlFrame = ss.tmpl['dashboard-widgets-cpu-frame'].render({
                        "widget-id": self.id,
                        number: cpuNum,
                        frameclass: frameclass,
                    });
                    $(htmlFrame).appendTo(rowfluid);
                    self.cpuPlots[cpuNum] = _makeCPUPlot.call(self, $('#' + self.id + ' .wcpu-graph-'+cpuNum), cpuNum);
                    if (count > cpuCount) {
                        break;
                    }
                }
            }
            self.cpuCount = cpuCount;
            cb.call(self);
        });
    }

    function _build() {
        var htmlBase = ss.tmpl['dashboard-widgets-cpu-base'].render({id: this.id}), htmlFrame, self;
        self = this;
        this.container.html(htmlBase);
        var framesContainer = $('.wcpu-frames', this.container);
        _buildCPULoadGrid.call(this, $('.wcpu-frames', this.container), function() {
            _resizeCPUFrames.call(self);
            _updateCPULoadGrid.call(self);
            $('#'+self.id+' .progress .bar').progressbar({
                transition_delay: 0,
                refresh_speed: 0,
                display_text: 0,
            });
        });

        $(window).on("debouncedresize", function() {
            _resizeCPUFrames.call(self);
            setTimeout(function() {
                _resizeCPUFrames.call(self);
            }, 2000);
        });
    }

    //Constructor
    function WCpu(container, id, conf) {
        _configure.call(this, container, id, conf || {});
        _build.call(this);
    }

    exports.factory = WCpu;

}(typeof exports === 'undefined' ? window : exports, ss, jQuery));
