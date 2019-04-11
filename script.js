//Setup dimensions
const zoomFactor = 50;
const w = 20 * zoomFactor;
const h = 10 * zoomFactor;
const legendHeight = 2 * zoomFactor;
const padding = 70;

const svg = d3.select("div")
              .append("svg")
              .attr("width", w)
              .attr("height", h)
              .append("g");

let dataSource = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";
// let dataSource = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json";
// let dataSource = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

let colorList =['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000'];
let colorObject = {};


d3.json(dataSource).then(function(data) {
    // attach the colorList to the list of names in the colorObject:
    for(let i=0; i<data.children.length; i++) {
        colorObject[data.children[i]["name"]] = colorList[i];
    }
    // Setup treemap 
    var root = d3.hierarchy(data);
    var treemapLayout = d3.treemap();
    treemapLayout
      .size([w, h - legendHeight])
      .paddingOuter(0);    
    root.sum(d => d.value);
    treemapLayout(root);

    // Create tooltip
    var div = d3.select("body").append("div")   
      .attr("id", "tooltip")         
      .style("opacity", 0);

    var nodes = d3.select('svg g')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => 'translate(' + [d.x0, d.y0] + ')')

    // Add rectangles to treemap
    nodes
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('class', 'tile')
      // Add properties to satisfy user stories
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category ? d.data.category : 'non-leaf')
      .attr("data-value", d => d.value)
      // Add color
      .attr("fill", d => colorObject[d.data.category])
      // Add tooltip to treemap
      .on("mouseover", function(d) {       
            div.transition()        
                .duration(200)      
                .style("opacity", 0.95);   
            div .attr("data-value", d3.select(this).attr("data-value"))
                .html("Category: " + d3.select(this).attr("data-category")
                      + "<br/>"  + 
                      "Name: " + d3.select(this).attr("data-name")
                      + "<br/>"  + 
                      "Value: " + d3.select(this).attr("data-value")
                      )
                .style("left", (d3.event.pageX + 10) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });

    // Add labels to rectangles
    nodes
      .append('text')
      .attr('dx', 4)
      .attr('dy', 14)
      .attr("fill", "white")
      .style("font-size", "0.7em")
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .text(d => d.data.name)

    // Add legend
    const legend = d3.select("svg")
                     .append("g")
                     .attr("id", "legend");

    const numberOfColumns = Math.ceil(data.children.length / 4);

    legend.selectAll("rect")
      .data(data.children)
      .enter()
      .append("rect")
      .attr("class", "legend-item")
      .attr("fill", c => colorObject[c.name])
      .attr("x", (c,i) => w/2 - 100 * numberOfColumns + 200 * parseInt(i/4) + 50)
      .attr("y", (c,i) => h - legendHeight + 25*(i%4) + 10)
      .attr("width", 15)
      .attr("height", 15);

    legend.selectAll("text")
      .data(data.children)
      .enter()
      .append("text")
      .attr("x", (c,i) => w/2 - 100 * numberOfColumns + 200 * parseInt(i/4) + 75)
      .attr("y", (c,i) => h - legendHeight + 25*(i%4) + 23)
      .text(c => c.name);
});



