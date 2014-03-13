/**
		 * search a database by state abbreviation
		 * @param searchDB {TAFFY} database to be searched
		 * @param abbrs {string[]} array of state abbreviations
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function searchDBByAbbr(searchDB, abbrs) {
			var results = [];
			results.push(searchDB({StateAbbr:abbrs}).get())
			return searchDB({Rank:{"!is": 0}},{StateAbbr:abbrs}).get();
		}
        // This version outputs the queryset with HS_codes
		function searchDBByAbbr_HS(searchDB, abbrs,HSarray) {
			// console.log('Filtering HS Code')
			var results = [];
			results.push(searchDB({StateAbbr:abbrs},{HSCode:HSarray}).get())
			if(HSarray.length==0){
				return  searchDB({HSCode:{"!is": 0}},{StateAbbr:abbrs}).get()
			}
			return searchDB({Rank:{"!is": 0}},{StateAbbr:abbrs},{HSCode:HSarray}).order("2012Value desc").get();
		}

/**
		 * search exportTop25DB for the top US exports
		 * @param numberOfResults {Number} Number of top results to be returned
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function top25(db, sortby) {
			var searchParam = sortby;
			var searchDB = db;
			var exportSums = [];
			var distinctHSCodes = searchDB().distinct("HSCode");
			for (i=0; i<distinctHSCodes.length; i++) {
				var exportSumsKey = distinctHSCodes[i];
				if (exportSumsKey != 0) {
					exportSums.push({
						hs: exportSumsKey, 
						desc: searchDB({HSCode:exportSumsKey}).first().Description, 
						val: searchDB().filter({HSCode:exportSumsKey}).sum(searchParam)
					});
				}			
			}
			exportSums.sort(function(a,b) { return parseFloat(b.val) - parseFloat(a.val) } );
			var top25results = exportSums.slice(0,25);
			console.log(top25results);
			return top25results;
		}
/**
		 * populate multi-select listbox with all states
		 */
		function populateListbox() {
			var select = document.getElementById("statesListbox_by_country");
			var select2 = document.getElementById("statesListbox_by_commody");
			stateAbbreviationsDB().each(function (s) {
				select.options[select.options.length] = new Option(s.State, s.Abbreviation);
				select2.options[select2.options.length] = new Option(s.State, s.Abbreviation);
				//Make the first option selected by default
				$("#statesListbox_by_country")[0].selectedIndex = 0
				$("#statesListbox_by_commody")[0].selectedIndex = 0
			});
		}

		//populates the results table based on db and state selection
		function populateResultsTable_by_country() {

			var selectedStates = $("#statesListbox_by_country").val() || [];
			var HSarray = selected_HS6_Codes

			importResultsTable_by_country = searchDBByAbbr(importDestinationDB, selectedStates);
			exportResultsTable_by_country = searchDBByAbbr(exportDestinationDB, selectedStates);
			console.log('selectedStates: ')
			console.log(selectedStates)
			console.log('importResultsTable_by_country: ')
			console.log(importResultsTable_by_country)
			console.log('exportResultsTable_by_country: ')
			console.log(exportResultsTable_by_country)
			drawChart_by_country()
		}
		function populateResultsTable_by_commody() {

			var selectedStates = $("#statesListbox_by_commody").val() || [];
			var HSarray = selected_HS6_Codes
 
			importResultsTable_by_commody = searchDBByAbbr_HS(importTop25DB, selectedStates, HSarray);
			exportResultsTable_by_commody = searchDBByAbbr_HS(exportTop25DB, selectedStates, HSarray);
			console.log('selectedStates: ')
			console.log(selectedStates)
			console.log('HScode: ')
			console.log(HSarray)
			console.log('importResultsTable_by_commody: ')
			console.log(importResultsTable_by_commody)
			console.log('exportResultsTable_by_commody: ')
			console.log(exportResultsTable_by_commody)
			drawChart_by_commody()
		}


// Used to generate regex expression for HS2
	function regex2gen(number)
	{
        var tempstr = '^'
        var numstr = number.toString()
        for (var i=0;i<numstr.length;i++)
		{ 
			tempstr += '['+numstr[i]+']'
		}
		tempstr += '$'

		return (new RegExp(tempstr))
	}
    //  Used to generate regex expresion for HS4 and HS6 from HS2 and HS4 respectively
		function regexgen(number, digNum)
	{   
		digNum = typeof digNum !== 'undefined' ? digNum : 2;
        var tempstr = '^'
        var numstr = number.toString()
        for (var i=0;i<numstr.length;i++)
		{ 
			tempstr += '['+numstr[i]+']'
		}
		for (var i=0; i<digNum;i++)
		{
			tempstr += '[0-9]'
		}
		tempstr += '$'

		return (new RegExp(tempstr))
	}

	function HS6_Code_Update(){ 
		selected_HS6_Codes = []

		includeDetail = document.getElementById("includeDetail").checked

		if(includeDetail){// code for detailed selection box
			var queryArray=[]
			for (var i in selectedValues){
        	// derive HS6 code from HS6 code
                queryArray.push(regexgen(selectedValues[i],0))    		   
	        }
            selected_HS6_Codes=HS6({hs_code:{regex: queryArray}}).select("hs_code")
		}
		else{// code for no-detail selection box
			var queryArray=[]
			for (var i in selectedValues){
        	// derive HS6 code from HS2 code
                queryArray.push(regexgen(selectedValues[i],4))    		   
	        }
            selected_HS6_Codes=HS6({hs_code:{regex: queryArray}}).select("hs_code")
		}
	        // stringiy HS6 matrix and display them
        var x=document.getElementById("selected_HS_Code"); 
            // console.log(selected_HS6_Codes)
			// x.innerHTML= JSON.stringify(selected_HS6_Codes);
	}

// As the starting choosing list
    var firstLevel = [{description:"01-05  Animal &amp; Animal Products",start:1,end:5},
    {description:'06-15  Vegetable Products',start:6,end:15},
    {description:'16-24  Foodstuffs',start:16,end:24},
    {description:'28-38  Chemicals & Allied Industries',start:28,end:38},
    {description:'39-40  Plastics / Rubbers',start:39,end:40},
    {description:'41-43  Raw Hides, Skins, Leather, & Furs',start:41,end:43},
    {description:'44-49  Wood & Wood Products',start:44,end:49},
    {description:'50-63  Textiles',start:50,end:63},
    {description:'64-67  Footwear / Headgear',start:64,end:67},
    {description:'68-71  Stone / Glass',start:68,end:71},
    {description:'72-83  Metals',start:72,end:83},
    {description:'84-85  Machinery / Electrical',start:84,end:85},
    {description:'86-89  Transportation',start:86,end:89},
    {description:'90-97  Miscellaneous',start:90,end:97},
    {description:'98-99  Service',start:98,end:99}]
    function selectionBox(){
    	// Generate the OPTgroup for select section
	    for(var level in firstLevel)
		{  
		    var startOPT = "<optgroup label='"+firstLevel[level].description+"'>"
	        var options = ''
		    for( var i= firstLevel[level].start ; i<= firstLevel[level].end; i++ )
		    	// <option value="1.4">Option 4</option>
		    {   
		    	if( HS2({hs_code:{regex: regex2gen(i)}}).first() ){
		    		var includeDetail = document.getElementById("includeDetail").checked
		    		if(includeDetail){
			        		// derive HS6 code from HS2code
			        		// Here we use temp to cache small array for better performance 
			        		HS6({hs_code:{regex: regexgen(i, 4)}}).each(function (record,recordnumber) {
			                    // selected_HS6_Codes.push({'hs_6': record.hs_code, 'description':record.description})
			                    options = options + "<option value='" + record.hs_code +"'>"+record.hs_code+" : "+record.description+"</option> \n"
			        		});
		    		}
		    		else{
		    			options = options + "<option value='" + i +"'>"+      HS2({hs_code:{regex: regex2gen(i)}}).first().description     +"</option> \n"
		    		}		            
		        }
		    }
		    var endOPT = "</optgroup>"
		   $(startOPT + options + endOPT).appendTo('#First_Level_Selection');
		}

    }

    function selectBoxInitialization(){
		    //  Initialize the multi-selector
	        $("#First_Level_Selection").multipleSelect({
	        	filter: true,
	            multiple: true,
	            multipleWidth: 1000,

	            //Selection API, uncomment to use

	            // onOpen: function() {
	            //     // $('#eventResult').text('Select opened!');
	            //     selectionUpdate()
	            // },
	            // onClose: function() {
	            //     // $('#eventResult').text('Select closed!');
	            //     selectionUpdate()
	            // },
	            onCheckAll: function() {
	                // $('#eventResult').text('Check all clicked!');
	                selectionUpdate()
	
	            },
	            onUncheckAll: function() {
	                // $('#eventResult').text('Uncheck all clicked!');
	                selectionUpdate()

	            },
	            onOptgroupClick: function(view) {
	                // var values = $.map(view.children, function(child){
	                //     return child.value;
	                // }).join(', ');
	                // $('#eventResult').text('Optgroup ' + view.label + ' ' + 
	                //     (view.checked ? 'checked' : 'unchecked') + ': ' + values);
	                selectionUpdate()

	            },
	            onClick: function(view) {
	                // $('#eventResult').text(view.label + '(' + view.value + ') ' + 
	                //     (view.checked ? 'checked' : 'unchecked'));
	                selectionUpdate()

	            }
	        });
		// $("#First_Level_Selection").multipleSelect("checkAll"); // select all options if needed
    }

    // collect selected datas
     function selectionUpdate() {

        selectedValues = $("#First_Level_Selection").multipleSelect("getSelects");
        var selectedTexts = $("#First_Level_Selection").multipleSelect("getSelects", "text");
        HS6_Code_Update()
// <<<<<<< HEAD
        populateResultsTable_by_commody()
    };


  function drawChart_by_commody() {

  	var commodies = importResultsTable_by_commody;
  	var commodies_export = exportResultsTable_by_commody;
  	var dataArray = []
  	var dataArray_export =[]
  	var year = year_to_show

  	dataArray.push(['Description',year+' value'])
  	dataArray_export.push(['Description',year+' value'])
  	for(var i =0; i<commodies.length; i++){
  		var temp= [commodies[i]['Description'] , commodies[i][year+'Value']]
  		dataArray.push(temp)
  	}
  	for(var i =0; i<commodies_export.length; i++){
  		var temp= [commodies_export[i]['Description'] , commodies_export[i][year+'Value']]
  		dataArray_export.push(temp)
  	}
  	// var state = commodies[0]['StateAbbr']
    var state = $("#statesListbox_by_commody").val() || [];

    data_by_commody = google.visualization.arrayToDataTable(dataArray);
    data_by_commody_export = google.visualization.arrayToDataTable(dataArray_export);
    data_by_commody.sort([{column: 1, desc: true}]);
    data_by_commody_export.sort([{column: 1, desc: true}]);

    var options = {
      title: 'ImportTop25'+' to '+state+' in '+year 
    };
    var options_export = {
      title: 'ExportTop25'+' from '+state+' in '+year
    };

    chart_by_commody = new google.visualization.PieChart(document.getElementById('piechart_by_commody'));
    chart_by_commody_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_commody'));
    chart_by_commody.draw(data_by_commody, options);
    chart_by_commody_export.draw(data_by_commody_export, options_export);
    google.visualization.events.addListener(chart_by_commody, 'select', selectHandler_by_commody);
    google.visualization.events.addListener(chart_by_commody_export, 'select', selectHandler_by_commody_export);
  }

function drawChart_by_country() {

  	var countries = importResultsTable_by_country;
  	var countries_export = exportResultsTable_by_country;
  	var dataArray = []
  	var dataArray_export = []
  	var year = year_to_show_by_country
  	dataArray.push(['Country', year+' Value'])
  	dataArray_export.push(['Country',year+' Value'])
  	for(var i =0; i<countries.length; i++){
  		var temp= [countries[i]['Country'] , countries[i][year+'Value']]
  		dataArray.push(temp)
  	}
  	for(var i =0; i<countries_export.length; i++){
  		var temp= [countries_export[i]['Country'] , countries_export[i][year+'Value']]
  		dataArray_export.push(temp)
  	}
  	// var state = countries[0]['StateAbbr']
  	var state = $("#statesListbox_by_country").val() || [];

    data_by_country = google.visualization.arrayToDataTable(dataArray);
    data_by_country_export = google.visualization.arrayToDataTable(dataArray_export);
    data_by_country.sort([{column: 1, desc: true}]);
    data_by_country_export.sort([{column: 1, desc: true}]);
     
    var options = {
      title: 'Import Trading Partners'+' to '+state+' in '+year
    };

    var options_export = {
      title: 'Export Trading Partners'+' from '+state+' in '+year
    };

    chart_by_country = new google.visualization.PieChart(document.getElementById('piechart_by_country'));
    chart_by_country_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_country'));
    chart_by_country.draw(data_by_country, options);
    chart_by_country_export.draw(data_by_country_export, options_export);
    // console.log('before selection binding_by_country')
    google.visualization.events.addListener(chart_by_country, 'select', selectHandler_by_country);
    google.visualization.events.addListener(chart_by_country_export, 'select', selectHandler_by_country_export);
    chart_by_country.setSelection([{row: 0}]);
    chart_by_country_export.setSelection([{row: 0}]);
  }

function selectHandler_by_commody() {

	var selection = chart_by_commody.getSelection();
	var data_of_pie_Chart =  data_by_commody
  	  var message = '';
	  for (var i = 0; i < selection.length; i++) {
	    var item = selection[i];
	    if (item.row != null && item.column != null) {
	      var str = data_of_pie_Chart.getFormattedValue(item.row, item.column);
	    } else if (item.row != null) {
	      var str = data_of_pie_Chart.getFormattedValue(item.row, 0);
	    } else if (item.column != null) {
	      var str = data_of_pie_Chart.getFormattedValue(0, item.column);
	    }
	  }
	  //draw the column chart
	  drawColumnChart_by_commody(str, 'import')
}
function selectHandler_by_commody_export() {

  	  var selection = chart_by_commody_export.getSelection();
	  var data_of_pie_Chart =  data_by_commody_export

  	  var message = '';
	  for (var i = 0; i < selection.length; i++) {
	    var item = selection[i];
	    if (item.row != null && item.column != null) {
	      var str = data_of_pie_Chart.getFormattedValue(item.row, item.column);
	    } else if (item.row != null) {
	      var str = data_of_pie_Chart.getFormattedValue(item.row, 0);
	    } else if (item.column != null) {
	      var str = data_of_pie_Chart.getFormattedValue(0, item.column);
	    }
	  }
	  //draw the column chart
	  drawColumnChart_by_commody(str, 'export')
}

function selectHandler_by_country() {
  var selection = chart_by_country.getSelection();
  // obtain selected value
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data_by_country.getFormattedValue(item.row, item.column);
    } else if (item.row != null) {
      var str = data_by_country.getFormattedValue(item.row, 0);
    } else if (item.column != null) {
      var str = data_by_country.getFormattedValue(0, item.column);
    }
  }
  drawColumnChart_by_country(str, 'import')
}
function selectHandler_by_country_export() {
  var selection = chart_by_country_export.getSelection();
  // obtain selected value
  var message = '';
  for (var i = 0; i < selection.length; i++) {
    var item = selection[i];
    if (item.row != null && item.column != null) {
      var str = data_by_country_export.getFormattedValue(item.row, item.column);
    } else if (item.row != null) {
      var str = data_by_country_export.getFormattedValue(item.row, 0);
    } else if (item.column != null) {
      var str = data_by_country_export.getFormattedValue(0, item.column);
    }
  }
  drawColumnChart_by_country(str,'export')
}

function drawColumnChart_by_commody(str, ImorEx) {
	if(ImorEx == 'import'){
        if(str){
        var result = $.grep(importResultsTable_by_commody, function(e){ return e.Description == str; });
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2009' , result[0]['2009Value']])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Import Detail of '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_by_commody'));
        chart.draw(data, options);
        }else{//if the object is not chosen, do not do anything
        }
	}else{
		if(str){
        var result = $.grep(exportResultsTable_by_commody, function(e){ return e.Description == str; });
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2009' , result[0]['2009Value']])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Export Detail of '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('export_columnchart_by_commody'));
        chart.draw(data, options);
        }else{//if the object is not chosen, do not do anything
        }
	}
}

function drawColumnChart_by_country(str, ImorEx) {
	if(ImorEx == 'import'){
        if(str){
        	        console.log(importResultsTable_by_country)
        var result = $.grep(importResultsTable_by_country, function(e){ return e.Country == str; });
        console.log(ImorEx)
        console.log(result)
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2009' , result[0]['2009Value']])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Import Detail for '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_by_country'));
        chart.draw(data, options);
        }else{//if the object is not chosen, do not do anything
        }
	}else{
        if(str){
        	        console.log(str)
        var result = $.grep(exportResultsTable_by_country, function(e){ return e.Country == str; });
        console.log(ImorEx)
        console.log(result)
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2009' , result[0]['2009Value']])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Export Detail for '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('export_columnchart_by_country'));
        chart.draw(data, options);
        }else{//if the object is not chosen, do not do anything
        }
	}
}
    
    // draw US map and query database when a state is clicked
	function drawRegionsMap_by_commody() {
		var USMapStatesArray = [['City', 'Imports']];	
		var dataset = google.visualization.arrayToDataTable(USMapStatesArray);		
		var USMapOptions = {};
		USMapOptions['displayMode'] = 'regions';
		USMapOptions['region'] = 'US';
		USMapOptions['resolution'] = 'provinces';
		USChart = new google.visualization.GeoChart(document.getElementById('USchart_div_by_commody'));
		//gets US map's selection
		google.visualization.events.addListener(USChart, 'regionClick', function(eventData) {
			var selectedRegion = eventData.region;
			var selectedRegionAbbr = selectedRegion.substring(selectedRegion.indexOf('-')+1);
			var HSarray = selected_HS6_Codes;
			console.log('draw US map:')
			console.log(selectedRegionAbbr)
			$("#statesListbox_by_commody").val(selectedRegionAbbr)
			populateResultsTable_by_commody()
		});
		USChart.draw(dataset, USMapOptions);
	};
	function drawRegionsMap_by_country() {
		var USMapStatesArray = [['City', 'Imports']];	
		var dataset = google.visualization.arrayToDataTable(USMapStatesArray);		
		var USMapOptions = {};
		USMapOptions['displayMode'] = 'regions';
		USMapOptions['region'] = 'US';
		USMapOptions['resolution'] = 'provinces';
		USChart = new google.visualization.GeoChart(document.getElementById('USchart_div_by_country'));
		//gets US map's selection
		google.visualization.events.addListener(USChart, 'regionClick', function(eventData) {
			var selectedRegion = eventData.region;
			var selectedRegionAbbr = selectedRegion.substring(selectedRegion.indexOf('-')+1);
			var HSarray = selected_HS6_Codes;
			console.log('draw US map:')
			console.log(selectedRegionAbbr)
			$("#statesListbox_by_country").val(selectedRegionAbbr)
			populateResultsTable_by_country()
		});
		USChart.draw(dataset, USMapOptions);
	};