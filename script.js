function finalproject() {
    allfunctions();
}

let allfunctions = function () {
    h2h();
    tabular();
    indmap();
}

let h2h = function () {

    d3.json("node_link_data.json").then(function (data) {
        var margin = { top: 20, right: 50, bottom: 100, left: 60 };
        var width = 1500 - margin.left - margin.right;
        var height = 800 - margin.top - margin.bottom;
        let zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', function (event) {
                svg.selectAll("g")
                    .attr('transform', event.transform);
                svg.selectAll("line")
                    .attr('transform', event.transform);
            });

        // Create the SVG element
        var svg = d3.select("#head2head")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var defs = svg.append('svg:defs');

        const link = svg.selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .style("stroke-width", 7)
            .attr("stroke", function (d) {
                console.log(`${d.source}${d.target}`)
                const offsetPercentage = d.win_ratio;

                const gradient = defs.append('linearGradient')
                    .attr('id', 'svgGradient' + `${d.source}${d.target}`);

                gradient.append('stop')
                    .attr('class', 'start')
                    .attr('offset', `${offsetPercentage}%`)
                    .attr('stop-color', 'black')
                    .attr('stop-opacity', 1);

                gradient.append('stop')
                    .attr('class', 'end')
                    .attr('offset', `${100 - offsetPercentage}%`)
                    .attr('stop-color', 'red')
                    .attr('stop-opacity', 1);

                return 'url(#svgGradient' + `${d.source}${d.target}` + ')';
            })
            .style("stop-opacity", 1);

        var tooltip = d3.select("#head2head")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style('opacity', 0)

        link.on("mouseover", function (event, d) {
            var message = `${d.source.team} to ${d.target.team} is ${d.win_ratio}%`
            // console.log(d)
            tooltip.style("opacity", 1);
            tooltip.html(message)
                .style("left", (event.pageX) + 10 + "px")
                .style("top", (event.pageY - 28) + "px")
                .style("opacity", 1);
        })
            .on('mousemove', function (event, d) {
                tooltip
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0);
            });



        const force = d3.forceSimulation(data.nodes)
            .force("charge", d3.forceManyBody().strength(-10000))
            .force("link", d3.forceLink(data.links).id((d) => d.id))
            .force("center", d3.forceCenter(width / 2, height / 2))

        function getImagePath(team) {
            return team + '.png'
        }
        let nodeRadius = 50
        var node = svg.selectAll('.node')
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", nodeRadius)
            .attr("fill", function (d) { return "url(#" + d.team.toLowerCase().replace(/\s+/g, '') + "Pattern)"; })


        data.nodes.forEach(function (d) {
            var patternId = d.team.toLowerCase().replace(/\s+/g, '') + "Pattern";

            defs.append("svg:pattern")
                .attr("id", patternId)
                .attr("width", 1)
                .attr("height", 1)
                .append("svg:image")
                .attr("xlink:href", getImagePath(d.team))
                .attr("width", nodeRadius * 2)
                .attr("height", nodeRadius * 2)
                .attr("x", -nodeRadius + 50)
                .attr("y", -nodeRadius + 50);
        });

        // Define the drag interaction
        var drag = d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded);

        // Call the drag interaction on the nodes
        node.call(drag);

        // Drag event functions
        function dragStarted(event, d) {
            if (!event.active) force.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragEnded(event, d) {
            if (!event.active) force.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }


        force.on("tick", function () {
            link.attr("x1", function (d) {
                return d.source.x;
            })
                .attr("y1", function (d) {
                    return d.source.y;
                })
                .attr("x2", function (d) {
                    return d.target.x;
                })
                .attr("y2", function (d) {
                    return d.target.y;
                });
            node.attr("cx", function (d) {
                return d.x;
            })
                .attr("cy", function (d) {
                    return d.y;
                });
        });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 15 - margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .text("IPL Head to Head Network (2013 -)");
    })
}

let tabular = function () {
    d3.json("tabular.json").then(function (data) {
        // console.log(data)
        data.sort(function (a, b) {
            return b.Runs - a.Runs;
        });
        var margin = { top: 50, right: 50, bottom: 60, left: 60 };
        var width = 1500 - margin.left - margin.right;
        var height = 800 - margin.top - margin.bottom;

        var tooltip = d3.select("#tabular")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style('opacity', 0)

        // Create the SVG element
        var svg = d3.select("#tabular")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Extracting data from the dataset
        var teams = data.map(item => item.Team);
        var runs = data.map(item => item.Runs);
        var wickets = data.map(item => item.Wickets);

        var xScale = d3.scaleBand()
            .domain(teams)
            .range([0, width])
            .paddingInner(0.1)
            .paddingOuter(0.2);

        var yScaleRuns = d3.scaleLinear()
            .domain([0, d3.max(runs)])
            .range([height, 0]);

        var yScaleWickets = d3.scaleLinear()
            .domain([0, d3.max(wickets)])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScaleRuns).ticks(5))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");

        svg.append("g")
            .attr("transform", "translate(" + width + ",0)")
            .call(d3.axisRight(yScaleWickets).ticks(5))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");
        // Create the bars for runs
        svg.selectAll(".bar-runs")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar-runs")
            .attr("x", function (d) { return xScale(d.Team); })
            .attr("y", function (d) { return yScaleRuns(d.Runs); })
            .attr("width", xScale.bandwidth() / 2) // Adjust the bar width
            .attr("height", function (d) { return height - yScaleRuns(d.Runs); })
            .attr("fill", "#A0522D")
            .on("mouseover", function (event, d) {
                var message = `${d.Team}: ${d.Runs} runs`
                console.log(message)
                tooltip.style("opacity", 1);
                tooltip.html(message)
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("opacity", 1);;
            })
            .on('mousemove', function (event, d) {
                tooltip
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0);
            });;

        // Create the bars for wickets
        svg.selectAll(".bar-wickets")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar-wickets")
            .attr("x", function (d) { return xScale(d.Team) + xScale.bandwidth() / 2; }) // adjust the bar position
            .attr("y", function (d) { return yScaleWickets(d.Wickets); })
            .attr("width", xScale.bandwidth() / 2) // adjust the bar width
            .attr("height", function (d) { return height - yScaleWickets(d.Wickets); })
            .attr("fill", "#8B0000")
            .on("mouseover", function (event, d) {
                var message = `${d.Team}: ${d.Wickets} wickets`
                console.log(message)
                tooltip.style("opacity", 1);
                tooltip.html(message)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("opacity", 1);;
            })
            .on('mousemove', function (event, d) {
                tooltip
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (d) {
                tooltip.style("opacity", 0);
            });

        // Add x-axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .style("text-anchor", "middle")
            .text("Teams");

        // Add both y-axis labels
        svg.append("text")
            .attr("class", "y-axis-label-right")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", width + margin.right - 20)
            .style("text-anchor", "middle")
            .text("Wickets");

        svg.append("text")
            .attr("class", "y-axis-label-left")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 20)
            .style("text-anchor", "middle")
            .text("Runs");

        // Add chart title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 15 - margin.top / 2 - 15)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .text("Average Runs and Wickets each team has won by");

    });


}

let makeMap = function (myData) {
    d3.json("india_states.geojson").then(function (mapData) {
        d3.select("#india svg").remove();
        var width = 800;
        var height = 600;


        var tooltip = d3.select("#india")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style('opacity', 0)

        // Create the SVG container
        var svg = d3
            .select("#india")
            .append("svg")
            .attr("width", width)
            .attr("height", height + 50);
        // Prepare the color scale
        var colorScale = d3.scaleSequential(d3.interpolateRgb("red", "green"))
            .domain([0, 1]);
        // Create a projection for India
        var projection = d3.geoMercator().fitSize([width, height], mapData);

        // Create a path generator
        var path = d3.geoPath().projection(projection);

        // Draw the map
        svg
            .selectAll("path")
            .data(mapData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", function (d) {
                try {
                    var matchedState = myData.find(s => s[0] === d.properties.ST_NM);
                    return colorScale(matchedState[1]);
                } catch (error) {
                    return "lightgray";
                }
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 0.9);
                try {
                    var stuff = myData.find(s => s[0] === d.properties.ST_NM);
                    var state = stuff[0]
                    var stat = (stuff[1]).toFixed(2)
                    message = `${state}: ${stat}`
                    tooltip
                        .html(message)
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                } catch (error) {
                    tooltip.transition().duration(200).style("opacity", 0);
                }
            })
            .on('mousemove', function (event, d) {
                tooltip
                    .style("left", (event.pageX) + 10 + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (event, d) {
                tooltip.transition().duration(200).style("opacity", 0);
            });
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2 + 80)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .text("Batting first win rates across IPL stadiums");
    })

}

let indmap = function () {
    d3.json("map_dataset.json").then(function (dataset) {
        var seasons = Array.from(new Set(dataset.map(function (d) {
            return d.Season;
        })))
        // console.log(seasons);

        // Get the dropdown container element
        var dropdownContainer = document.getElementById("dropdown-container");

        // Create the select element
        var selectElement = document.createElement("select");
        selectElement.id = "season-dropdown";

        // Create options for each unique season
        seasons.forEach(function (season) {
            var optionElement = document.createElement("option");
            optionElement.value = season;
            optionElement.text = season;
            selectElement.appendChild(optionElement);
        });

        let defaultSeason = seasons[0]
        console.log(defaultSeason)

        var filteredData = dataset.filter(d => d.Season == defaultSeason);
        // Calculate the average of isBatWin and isFieldWin for each state
        var stateData = d3.rollups(filteredData,
            v => d3.mean(v, d => d.isBatWin),
            d => d.State
        );

        makeMap(stateData)
        selectElement.addEventListener("change", function () {
            let selectedSeason = selectElement.value;
            console.log(selectedSeason)

            var filteredData = dataset.filter(d => d.Season == selectedSeason);
            // Calculate the average of isBatWin
            var stateData = d3.rollups(filteredData,
                v => d3.mean(v, d => d.isBatWin),
                d => d.State
            );

            makeMap(stateData)
        });
        // Append the select element to the dropdown container
        dropdownContainer.appendChild(selectElement);
    });
}