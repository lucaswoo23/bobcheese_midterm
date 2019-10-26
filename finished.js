'use strict';



(function() {
  const colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Electric": "#F28E2B",

    "Fairy": "#FFBE&D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#86BCB6",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295"

  }
  console.log(colors.Bug);
  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1800)
      .attr('height', 1000);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));

  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    // get arrays of fertility rate data and life Expectancy data
    let sp_def_data = data.map((row) => parseFloat(row["Sp. Def"]));
    let total_data = data.map((row) => parseFloat(row["Total"]));
    // find data limits
    let axesLimits = findMinMax(sp_def_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    var dropDown = d3.select("#filter").append("select")
      .attr("name", "generation-list");

      let generations = ['(All)'] 
      for(let i = 1; i <= 6; i++) {
        generations.push(i);
      }

      var options = dropDown.selectAll("option")
           .data(generations)
            .enter()
           .append("option");

      options.text(function (generations) { 
        return generations; })
      .attr("value", function (generations) { return generations; });

      dropDown.on("change", function() {
        // Call update to filter it if the drop down is changed (user changes generation)
        update(data);    
        console.log(d3.select("select").node().value)
        });
        // If any of the legendary checkboxes is changed.. call update
        d3.selectAll(".myCheckbox").on("change",update);
          update(data);
        
        
  }

  

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 30)
      .attr('y', 40)
      .style('font-size', '30pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 825)
      .attr('y', 990)
      .style('font-size', '17pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 550)rotate(-90)')
      .style('font-size', '17pt')
      .text('Total');

    // Handmade legend
    let legendy = 10;
    Object.keys(colors).forEach(function(key) {
      svgContainer.append("rect").attr("x",1650).attr("y",legendy - 8).attr("width", 12).attr("height", 12).style("fill", colors[key])
      svgContainer.append("text").attr("x", 1670).attr("y", legendy).text(key).style("font-size", "15px").attr("alignment-baseline","middle")
      legendy += 20;
    });
    

  }
 
  function update(){
    // var displayOthers = this.checked ? "inline" : "none";
    // var display = this.checked ? "none" : "inline";

    // Get the current generation selected
    var selected_gen = d3.select("select").node().value
    var display = 'inline'
    var displayOthers = 'none'
    // turn off the display of all the plotted points so it resets the graph
    svgContainer.selectAll("circle")
      .attr("display", displayOthers)
    // Create an empty array and put the checked check boxes into the array
    var choices = [];
    d3.selectAll(".myCheckbox").each(function(d){
      let cb = d3.select(this);
      if(cb.property("checked")){
        choices.push(cb.property("value"));
      }
    });
    console.log(choices);
    // for each checked box 
    for(let i = 0; i < choices.length; i++) {
      // get the current check box
      let selected = choices[i]
      // if the generation is set to all and same with legendary, you can show all plot
      if(selected == '(All)' && selected_gen == '(All)') {
        svgContainer.selectAll("circle")
          .attr("display", display);
      // if legendary is set to all, show filters for the current generation and both legendary or not
      } else if (selected == '(All)') {
        let selectAll = ["False", 'True']
        for(let i = 0; i < selectAll.length; i++){
          svgContainer.selectAll("circle")
          .filter(function(d) {return selectAll[i] == d.Legendary && selected_gen == d.Generation;})
          .attr("display", display);
        }
      // if generation is set to all, go through every generation and turn on the plots for every generation and the selected legendary
      } else if (selected_gen == '(All)') {
        let selectAll = [1, 2, 3, 4, 5, 6]
        for(let i = 0; i < selectAll.length; i++){
          svgContainer.selectAll("circle")
          .filter(function(d) {return selected == d.Legendary && selectAll[i] == d.Generation;})
          .attr("display", display);
        }
      } // else turn on the generation and legendary plot points
      else {
        svgContainer.selectAll("circle")
          .filter(function(d) {return selected == d.Legendary && selected_gen == d.Generation;})
          .attr("display", display);
      } 
      }
        
  }



  // function getColor(d) {
  //   console.log(d);
  //   return 'black';
  // }



  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // get population data as array
    // let pop_data = data.map((row) => +row["pop_mlns"]);
    // let pop_limits = d3.extent(pop_data);
    // // make size scaling function for population
    // let pop_map_func = d3.scaleLinear()
    //   .domain([pop_limits[0], pop_limits[1]])
    //   .range([5, 90]);
    // let types = data.map((row) => +row["Type 1"]);
    
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 12)
        .attr('stroke', "#4874B7")
        .style("fill", function (d) { return colors[d['Type 1']]; })         
        // add tooltip functionality to points
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d.Name + "<br/>" + d['Type 1'] +  "<br/>" + d['Type 2'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
      .range([50, 1600]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 950)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 50, limits.yMin - 50]) // give domain buffer
      .range([50, 950]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
