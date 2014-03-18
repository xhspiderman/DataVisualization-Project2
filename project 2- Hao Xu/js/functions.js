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
				return  searchDB({Rank:{"!is": 0}},{StateAbbr:abbrs}).get()
			}
			return searchDB({Rank:{"!is": 0}},{StateAbbr:abbrs},{HSCode:HSarray}).order("2013Value desc").get();
		}
        //This function provide search DB by (commody description) str
		function searchDBByDes(searchDB, str) {
			var results = [];
			results.push(searchDB({Description:str}).get())
			return searchDB({Rank:{"!is": 0}},{Description:str}).get();
		}
        //This function provide search DB by (trading country) str
		function searchDBByCon(searchDB, str) {
			var results = [];
			results.push(searchDB({Country:str}).get())
			return searchDB({Rank:{"!is": 0}},{Country:str}).get();
		}

		function FullStateByAbbr(abbr){
			return stateAbbreviationsDB({Abbreviation:{is:abbr}}).first().State
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
			var top25results = exportSums.slice(0,26);
			// console.log(top25results);
			return top25results;
		}
/**
		 * search a db for the top US export/import destinations
		 * @param numberOfResults {Number} Number of top results to be returned
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function top25Destination(db, sortby) {
			var searchParam = sortby;
			var searchDB = db;
			var exportSums = [];
			var distinctHSCodes = searchDB().distinct("StateAbbr");
			for (i=0; i<distinctHSCodes.length; i++) {
				var exportSumsKey = distinctHSCodes[i];
				if (exportSumsKey != 0) {
					exportSums.push({
						abbr: exportSumsKey,
						val: searchDB().filter({StateAbbr:exportSumsKey}).sum(searchParam)
					});
				}			
			}
			exportSums.sort(function(a,b) { return parseFloat(b.val) - parseFloat(a.val) } );
			//var top25results = exportSums.slice(0,26);
			// console.log(top25results);
			return exportSums;
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
			drawWorldMap_by_country()
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
      title: 'ImportTop25'+' to '+state+' in '+year ,
      legend: 'none',
    };
    var options_export = {
      title: 'ExportTop25'+' from '+state+' in '+year,
      legend: 'none',
    };

    if($('#piechart_by_commody').css('display')=='none'){
    	$('#piechart_by_commody').css('display','block')
    	chart_by_commody = new google.visualization.PieChart(document.getElementById('piechart_by_commody'));
    	chart_by_commody.draw(data_by_commody, options);
    	$('#piechart_by_commody').css('display','none')
    }else{
    	chart_by_commody = new google.visualization.PieChart(document.getElementById('piechart_by_commody'));
    	chart_by_commody.draw(data_by_commody, options);
    }

    if($("#export_piechart_by_commody").css('display')==='none'){

    	$("#export_piechart_by_commody").css('display','block')
    	chart_by_commody_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_commody'));
    	chart_by_commody_export.draw(data_by_commody_export, options_export);
    	$("#export_piechart_by_commody").css('display','none')
    }else{
    	chart_by_commody_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_commody'));
    	chart_by_commody_export.draw(data_by_commody_export, options_export);
    }

    google.visualization.events.addListener(chart_by_commody, 'select', selectHandler_by_commody);
    google.visualization.events.addListener(chart_by_commody_export, 'select', selectHandler_by_commody_export);

    ////////////////////////////////////////// Drawing for table of  piechart_by_commody_table export_piechart_by_commody_table
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
		
	    if($('#piechart_by_commody_table').css('display')=='none'){
	    	$('#piechart_by_commody_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('piechart_by_commody_table'));
	    	visualization_table.draw(data_by_commody, table_options);
	    	$('#piechart_by_commody_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('piechart_by_commody_table'));
	    	visualization_table.draw(data_by_commody, table_options);
	    }
	    if($('#export_piechart_by_commody_table').css('display')=='none'){
	    	$('#export_piechart_by_commody_table').css('display','block')
	    	export_visualization_table = new google.visualization.Table(document.getElementById('export_piechart_by_commody_table'));
	    	export_visualization_table.draw(data_by_commody_export, table_options);
	    	$('#export_piechart_by_commody_table').css('display','none')
	    }else{
			export_visualization_table = new google.visualization.Table(document.getElementById('export_piechart_by_commody_table'));
	    	export_visualization_table.draw(data_by_commody_export, table_options);
	    }
		
    //////////////////////////////////////////
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
      title: 'Import Trading Partners'+' to '+state+' in '+year,
      pieSliceText: 'label',
      legend: 'none',
    };

    var options_export = {
      title: 'Export Trading Partners'+' from '+state+' in '+year,
      pieSliceText: 'label',
      legend: 'none',
    };

    if($('#piechart_by_country').css('display')=='none'){
    	$('#piechart_by_country').css('display','block')
    	chart_by_country = new google.visualization.PieChart(document.getElementById('piechart_by_country'));
    	chart_by_country.draw(data_by_country, options);
    	$('#piechart_by_country').css('display','none')
    }else{
    	chart_by_country = new google.visualization.PieChart(document.getElementById('piechart_by_country'));
    	chart_by_country.draw(data_by_country, options);
    }

    if($("#export_piechart_by_country").css('display')==='none'){

    	$("#export_piechart_by_country").css('display','block')
    	chart_by_country_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_country'));
    	chart_by_country_export.draw(data_by_country_export, options_export);
    	$("#export_piechart_by_country").css('display','none')
    }else{
    	chart_by_country_export = new google.visualization.PieChart(document.getElementById('export_piechart_by_country'));
    	chart_by_country_export.draw(data_by_country_export, options_export);
    }

    google.visualization.events.addListener(chart_by_country, 'select', selectHandler_by_country);
    google.visualization.events.addListener(chart_by_country_export, 'select', selectHandler_by_country_export);
    // chart_by_country.setSelection([{row: 0}]);
    // chart_by_country_export.setSelection([{row: 0}]);
    ////////////////////////////////////////// Drawing for table of  piechart_by_country_table export_piechart_by_country_table
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
		
	    if($('#piechart_by_country_table').css('display')=='none'){
	    	$('#piechart_by_country_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('piechart_by_country_table'));
	    	visualization_table.draw(data_by_country, table_options);
	    	$('#piechart_by_country_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('piechart_by_country_table'));
	    	visualization_table.draw(data_by_country, table_options);
	    }
	    if($('#export_piechart_by_country_table').css('display')=='none'){
	    	$('#export_piechart_by_country_table').css('display','block')
	    	export_visualization_table = new google.visualization.Table(document.getElementById('export_piechart_by_country_table'));
	    	export_visualization_table.draw(data_by_country_export, table_options);
	    	$('#export_piechart_by_country_table').css('display','none')
	    }else{
			export_visualization_table = new google.visualization.Table(document.getElementById('export_piechart_by_country_table'));
	    	export_visualization_table.draw(data_by_country_export, table_options);
	    }
		
    //////////////////////////////////////////
  }
  
 function drawWorldMap_by_country() {

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
      title: 'Import Trading Partners'+' to '+state+' in '+year,
      region: 'world',
      legend: 'none',
    };

    var options_export = {
      title: 'Export Trading Partners'+' from '+state+' in '+year,
      region: 'world',
      legend: 'none',
    };

    if($('#geochart_by_country').css('display')=='none'){
    	$('#geochart_by_country').css('display','block')
    	geochart_by_country = new google.visualization.GeoChart(document.getElementById('geochart_by_country'));
    	geochart_by_country.draw(data_by_country, options);
    	$('#geochart_by_country').css('display','none')
    }else{
    	geochart_by_country = new google.visualization.GeoChart(document.getElementById('geochart_by_country'));
    	geochart_by_country.draw(data_by_country, options);
    }

    if($("#export_geochart_by_country").css('display')==='none'){
    	$("#export_geochart_by_country").css('display','block')
    	geochart_by_country_export = new google.visualization.GeoChart(document.getElementById('export_geochart_by_country'));
    	geochart_by_country_export.draw(data_by_country_export, options_export);
    	$("#export_geochart_by_country").css('display','none')
    }else{
    	geochart_by_country_export = new google.visualization.GeoChart(document.getElementById('export_geochart_by_country'));
    	geochart_by_country_export.draw(data_by_country_export, options_export);
    }

    google.visualization.events.addListener(geochart_by_country, 'select', geochart_selectHandler_by_country);
    google.visualization.events.addListener(geochart_by_country_export, 'select', geochart_selectHandler_by_country_export);
    // chart_by_country.setSelection([{row: 0}]);
    // chart_by_country_export.setSelection([{row: 0}]);
    ////////////////////////////////////////// Drawing for table of  piechart_by_country_table export_piechart_by_country_table
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
		
	    if($('#geochart_by_country_table').css('display')=='none'){
	    	$('#geochart_by_country_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('geochart_by_country_table'));
	    	visualization_table.draw(data_by_country, table_options);
	    	$('#geochart_by_country_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('geochart_by_country_table'));
	    	visualization_table.draw(data_by_country, table_options);
	    }
	    if($('#export_geochart_by_country_table').css('display')=='none'){
	    	$('#export_geochart_by_country_table').css('display','block')
	    	export_visualization_table = new google.visualization.Table(document.getElementById('export_geochart_by_country_table'));
	    	export_visualization_table.draw(data_by_country_export, table_options);
	    	$('#export_geochart_by_country_table').css('display','none')
	    }else{
			export_visualization_table = new google.visualization.Table(document.getElementById('export_geochart_by_country_table'));
	    	export_visualization_table.draw(data_by_country_export, table_options);
	    }
		
    //////////////////////////////////////////
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
	  drawTable_by_commody(str)
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
	  drawTable_by_commody(str)
}

function geochart_selectHandler_by_country() {
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
  drawTable_by_country(str)
}
function geochart_selectHandler_by_country_export() {
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
  drawTable_by_country(str)
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
  drawTable_by_country(str)
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
  drawTable_by_country(str)
}

function drawColumnChart_by_commody(str, ImorEx) {
	if(ImorEx == 'import'){
        if(str){
        var result = $.grep(importResultsTable_by_commody, function(e){ return e.Description == str; });
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		dataArray.push(['2013' , result[0]['2013Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Import Detail of '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'blue'}},
          legend: 'none',
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_by_commody'));
        chart.draw(data, options);
        ////////////////////////////////////////// Drawing for table of  columnchart_by_commody
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
		
	    if($('#columnchart_by_commody_table').css('display')=='none'){
	    	$('#columnchart_by_commody_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('columnchart_by_commody_table'));
	    	visualization_table.draw(data, table_options);
	    	$('#columnchart_by_commody_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('columnchart_by_commody_table'));
	    	visualization_table.draw(data, table_options);
	    }
		
	    //////////////////////////////////////////
        }else{//if the object is not chosen, do not do anything
        }
	}else{
		if(str){
        var result = $.grep(exportResultsTable_by_commody, function(e){ return e.Description == str; });
      	var record = result;
	  	var dataArray = []
	  	dataArray.push(['Year','Value'])
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		dataArray.push(['2013' , result[0]['2013Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Export Detail of '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'blue'}},
          legend: 'none',
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('export_columnchart_by_commody'));
        chart.draw(data, options);
        ////////////////////////////////////////// Drawing for table of  columnchart_by_commody
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
	    if($('#export_columnchart_by_commody_table').css('display')=='none'){
	    	$('#export_columnchart_by_commody_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('export_columnchart_by_commody_table'));
	    	visualization_table.draw(data, table_options);
	    	$('#export_columnchart_by_commody_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('export_columnchart_by_commody_table'));
	    	visualization_table.draw(data, table_options);
	    }
	    //////////////////////////////////////////
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
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		dataArray.push(['2013' , result[0]['2013Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Import Detail from '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'blue'}},
          legend: 'none',
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('columnchart_by_country'));
        chart.draw(data, options);
        ////////////////////////////////////////// Drawing for table of  columnchart_by_country
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
		
	    if($('#columnchart_by_country_table').css('display')=='none'){
	    	$('#columnchart_by_country_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('columnchart_by_country_table'));
	    	visualization_table.draw(data, table_options);
	    	$('#columnchart_by_country_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('columnchart_by_country_table'));
	    	visualization_table.draw(data, table_options);
	    }
		
	    //////////////////////////////////////////
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
  		dataArray.push(['2010' , result[0]['2010Value']])
  		dataArray.push(['2011' , result[0]['2011Value']])
  		dataArray.push(['2012' , result[0]['2012Value']])
  		dataArray.push(['2013' , result[0]['2013Value']])
  		var data = google.visualization.arrayToDataTable(dataArray);
        var options = {
          title: 'Export Detail to '+str,
          hAxis: {title: 'Year', titleTextStyle: {color: 'blue'}},
          legend: 'none',
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('export_columnchart_by_country'));
        chart.draw(data, options);
        ////////////////////////////////////////// Drawing for table of  export_columnchart_by_country
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 8;

		// Create and draw the visualization.
	    if($('#export_columnchart_by_country_table').css('display')=='none'){
	    	$('#export_columnchart_by_country_table').css('display','block')
	    	visualization_table = new google.visualization.Table(document.getElementById('export_columnchart_by_country_table'));
	    	visualization_table.draw(data, table_options);
	    	$('#export_columnchart_by_country_table').css('display','none')
	    }else{
			visualization_table = new google.visualization.Table(document.getElementById('export_columnchart_by_country_table'));
	    	visualization_table.draw(data, table_options);
	    }
	    //////////////////////////////////////////
        }else{//if the object is not chosen, do not do anything
        }
	}
}
    
    // draw US map and query database when a state is clicked
	function drawRegionsMap_by_commody() {
		var tradeData;
		var yearAttr = year_to_show + 'Value';
		if (ie_to_show==='import') {	
			tradeData = top25Destination(importDestinationDB, yearAttr);	
		} else {
			tradeData = top25Destination(exportDestinationDB, yearAttr);	
		}
		var USMapStatesArray = [['State', ie_to_show]];
		for (var i=0; i<tradeData.length; i++) {
			USMapStatesArray.push([tradeData[i].abbr, Math.round(tradeData[i].val)]);
		}
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
		var tradeData;
		var yearAttr = year_to_show + 'Value';
		if (ie_to_show==='import') {	
			tradeData = top25Destination(importDestinationDB, yearAttr);	
		} else {
			tradeData = top25Destination(exportDestinationDB, yearAttr);	
		}
		var USMapStatesArray = [['State', ie_to_show]];
		for (var i=0; i<tradeData.length; i++) {
			USMapStatesArray.push([tradeData[i].abbr, Math.round(tradeData[i].val)]);
		}	
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

function drawTable_by_commody(str) {

        if(str){
      	var record = searchDBByDes(importTop25DB, str);
      	var export_record = searchDBByDes(exportTop25DB, str);
	  	var dataArray = []
	  	var export_dataArray = []
	  	var options = {'page': 'enable'};
	  	options['pageSize'] = 8;

	  	dataArray.push(['State','2010 Value', '2011 Value','2012 Value','2013 Value'])
	  	export_dataArray.push(['State','2010 Value', '2011 Value','2012 Value','2013 Value'])
	  	for (var i=0; i<record.length; i++){
	  		dataArray.push([FullStateByAbbr(record[i]["StateAbbr"]), record[i]['2010Value'],record[i]['2011Value'],record[i]['2012Value'],record[i]['2013Value']])
	  	}
	  	for (var i=0; i<export_record.length; i++){
	  		export_dataArray.push([FullStateByAbbr(export_record[i]["StateAbbr"]), export_record[i]['2010Value'],export_record[i]['2011Value'],export_record[i]['2012Value'],export_record[i]['2013Value']])
	  	}
		// Create and populate the data table.
		var data = google.visualization.arrayToDataTable(dataArray);
		var export_data = google.visualization.arrayToDataTable(export_dataArray);
        data.sort([{column: 4, desc: true}])
        export_data.sort([{column: 4, desc: true}])
		// Create and draw the visualization.
		visualization = new google.visualization.Table(document.getElementById('import_table_by_commody'));
		export_visualization = new google.visualization.Table(document.getElementById('export_table_by_commody'));
		visualization.draw(data, options);
        export_visualization.draw(export_data, options);
        $('.import_table_title_by_commody').html("Import of <strong>"+str+"</strong> -- US Rank")
        $('.export_table_title_by_commody').html("Export of <strong>"+str+"</strong> -- US Rank")
        }else{//if the object is not chosen, do not do anything
        }
}

function drawTable_by_country(str) {

        if(str){
      	var record = searchDBByCon(importDestinationDB, str);
      	var export_record = searchDBByCon(exportDestinationDB, str);
	  	var dataArray = []
	  	var export_dataArray = []
	  	var options = {'page': 'enable'};
	  	options['pageSize'] = 8;

	  	dataArray.push(['State','2010 Value', '2011 Value','2012 Value','2013 Value'])
	  	export_dataArray.push(['State','2010 Value', '2011 Value','2012 Value','2013 Value'])
	  	for (var i=0; i<record.length; i++){
	  		dataArray.push([FullStateByAbbr(record[i]["StateAbbr"]), record[i]['2010Value'],record[i]['2011Value'],record[i]['2012Value'],record[i]['2013Value']])
	  	}
	  	for (var i=0; i<export_record.length; i++){
	  		export_dataArray.push([FullStateByAbbr(export_record[i]["StateAbbr"]), export_record[i]['2010Value'],export_record[i]['2011Value'],export_record[i]['2012Value'],export_record[i]['2013Value']])
	  	}
		// Create and populate the data table.
		var data = google.visualization.arrayToDataTable(dataArray);
		var export_data = google.visualization.arrayToDataTable(export_dataArray);
        data.sort([{column: 4, desc: true}])
        export_data.sort([{column: 4, desc: true}])
		// Create and draw the visualization.
		visualization = new google.visualization.Table(document.getElementById('import_table_by_country'));
		export_visualization = new google.visualization.Table(document.getElementById('export_table_by_country'));
		visualization.draw(data, options);
        export_visualization.draw(export_data, options);
        $('.import_table_title_by_country').html("Import from <strong>"+str+"</strong> -- US Rank")
        $('.export_table_title_by_country').html("Export to <strong>"+str+"</strong> -- US Rank")
        }else{//if the object is not chosen, do not do anything
        }
}

function showGraphs_by_commody(ie, pt){
	if (ie==='import'){
        $("#export_piechart_by_commody").hide()
        $("#export_columnchart_by_commody").hide()
        $("#export_piechart_by_commody_table").hide()
        $("#export_columnchart_by_commody_table").hide()
        if(pt==='PieChart'){
	        $("#piechart_by_commody").show()
	        $("#columnchart_by_commody").show()
	        $("#piechart_by_commody_table").hide()
	        $("#columnchart_by_commody_table").hide()
        }else{
	        $("#piechart_by_commody").hide()
	        $("#columnchart_by_commody").hide()
	        $("#piechart_by_commody_table").show()
	        $("#columnchart_by_commody_table").show()
        }

	}else{
        $("#piechart_by_commody").hide()
        $("#columnchart_by_commody").hide()
        $("#piechart_by_commody_table").hide()
        $("#columnchart_by_commody_table").hide()
        if(pt==='PieChart'){
	        $("#export_piechart_by_commody").show()
	        $("#export_columnchart_by_commody").show()
	        $("#export_piechart_by_commody_table").hide()
	        $("#export_columnchart_by_commody_table").hide()
        }else{
	        $("#export_piechart_by_commody").hide()
	        $("#export_columnchart_by_commody").hide()
	        $("#export_piechart_by_commody_table").show()
	        $("#export_columnchart_by_commody_table").show()
        }
	}
	}

function showGraphs_by_country(ie, pt){
	
	if (ie==='import'){
		//console.log("import success");
        $("#export_piechart_by_country").hide()
        $("#export_columnchart_by_country").hide()
        $("#export_geochart_by_country").hide()
        $("#export_piechart_by_country_table").hide()
        $("#export_columnchart_by_country_table").hide()
        $("#export_geochart_by_country_table").hide()
        if(pt==='PieChart'){
	        $("#piechart_by_country").show()
	        $("#columnchart_by_country").show()
	        $("#geochart_by_country").hide()
	        $("#piechart_by_country_table").hide()
	        $("#columnchart_by_country_table").hide()
	        $("#geochart_by_country_table").hide()
        }else if(pt==='WorldMap'){
	        $("#piechart_by_country").hide()
	        $("#columnchart_by_country").hide()
	        $("#geochart_by_country").show()
	        $("#piechart_by_country_table").hide()
	        $("#columnchart_by_country_table").hide()
	        $("#geochart_by_country_table").show()
        }else{
	        $("#piechart_by_country").hide()
	        $("#columnchart_by_country").hide()
	        $("#geochart_by_country").hide()
	        $("#piechart_by_country_table").show()
	        $("#columnchart_by_country_table").show()
	        $("#geochart_by_country_table").hide()
        }
	}else{
		//console.log("export success");
        $("#piechart_by_country").hide()
        $("#columnchart_by_country").hide()
        $("#geochart_by_country").hide()
        $("#piechart_by_country_table").hide()
        $("#columnchart_by_country_table").hide()
        $("#geochart_by_country_table").hide()
        if(pt==='PieChart'){
	        $("#export_piechart_by_country").show()
	        $("#export_columnchart_by_country").show()
	        $("#export_geochart_by_country").hide()
	        $("#export_piechart_by_country_table").hide()
	        $("#export_columnchart_by_country_table").hide()
	        $("#export_geochart_by_country_table").hide()
        }else if(pt==='WorldMap'){
	        $("#export_piechart_by_country").hide()
	        $("#export_columnchart_by_country").hide()
	        $("#export_geochart_by_country").show()
	        $("#export_piechart_by_country_table").hide()
	        $("#export_columnchart_by_country_table").hide()
	        $("#export_geochart_by_country_table").show()
        }else{
	        $("#export_piechart_by_country").hide()
	        $("#export_columnchart_by_country").hide()
	        $("#export_geochart_by_country").hide()
	        $("#export_piechart_by_country_table").show()
	        $("#export_columnchart_by_country_table").show()
	        $("#export_geochart_by_country_table").hide()
        }
	}
}

function showGraphs_top25(ie, year){
	if (ie === 'import'){

	var top25_commody = top25(importTop25DB, year+'Value');
  	var dataArray = []
  	dataArray.push(['Description',year+' value'])
  	for(var i =1; i<top25_commody.length; i++){
  		var temp= [top25_commody[i]['desc'] , Math.round(top25_commody[i]['val'])]
  		dataArray.push(temp)
  	}
    data_top25 = google.visualization.arrayToDataTable(dataArray);

    var options = {
      title: 'Import Top25 in US'+ ' in '+year ,
      chartArea:{left:5,top:19,width:"95%",height:"99%"},
      is3D: true,
      legend: 'none',
    };

	chart_top25 = new google.visualization.PieChart(document.getElementById('piechart_top25'));
	chart_top25.draw(data_top25, options);
    ////////////////////////////////////////// Drawing for table of  piechart_by_commody_table export_piechart_by_commody_table
  	var table_options = {'page': 'enable'};
  	table_options['pageSize'] = 18;
  	table_options['showRowNumber'] = true
	visualization_table = new google.visualization.Table(document.getElementById('top25_table'));
	visualization_table.draw(data_top25, table_options);

	}else{
        console.log(top25(exportTop25DB, year+'Value'));

		var top25_commody = top25(exportTop25DB, year+'Value');
	  	var dataArray = []
	  	dataArray.push(['Description',year+' value'])
	  	for(var i =1; i<top25_commody.length; i++){
	  		var temp= [top25_commody[i]['desc'] , Math.round(top25_commody[i]['val'])]
	  		dataArray.push(temp)
	  	}
	    data_top25 = google.visualization.arrayToDataTable(dataArray);

	    var options = {
	      title: 'Export Top25 in US'+ ' in '+year ,
	      chartArea:{left:5,top:19,width:"95%",height:"99%"},
	      is3D: true,
	      legend: 'none',
	    };

		chart_top25 = new google.visualization.PieChart(document.getElementById('piechart_top25'));
		chart_top25.draw(data_top25, options);
	    ////////////////////////////////////////// Drawing for table of  piechart_by_commody_table export_piechart_by_commody_table
	  	var table_options = {'page': 'enable'};
	  	table_options['pageSize'] = 18;
	  	table_options['showRowNumber'] = true

		visualization_table = new google.visualization.Table(document.getElementById('top25_table'));
		visualization_table.draw(data_top25, table_options);

	}
}



