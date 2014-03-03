/**
		 * search a database by state abbreviation
		 * @param searchDB {TAFFY} database to be searched
		 * @param abbrs {string[]} array of state abbreviations
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function searchDBByAbbr(searchDB, abbrs) {
			var results = [];
			results.push(searchDB({StateAbbr:abbrs}).get())
			return searchDB({StateAbbr:abbrs}).get();
		}
        // This version outputs the queryset with HS_codes
		function searchDBByAbbr_HS(searchDB, abbrs,HSarray) {
			// console.log('Filtering HS Code')
			var results = [];
			results.push(searchDB({StateAbbr:abbrs},{HSCode:HSarray}).get())
			if(HSarray.length==0){
				return  searchDB({StateAbbr:abbrs}).get()
			}
			return searchDB({StateAbbr:abbrs},{HSCode:HSarray}).order("2012Value desc").get();
		}

/**
		 * search exportTop25DB for the top US exports
		 * @param numberOfResults {Number} Number of top results to be returned
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function topUSExports(numberOfResults) {
			var results = [];
			var exportSums = [];
			var distinctHSCodes = exportTop25DB().distinct("HSCode");
			// console.log(distinctHSCodes);
			/*
			for (i=0; i<distinctHSCodes.length; i++) {
				var exportSumsKey = distinctHSCodes[i];
				//exportSums.push({distinctHSCodes[i]:exportTop25DB().filter({HSCode:distinctHSCodes[i]}).sum("2012Value")})
				exportSums[exportSumsKey] = exportTop25DB().filter({HSCode:distinctHSCodes[i]}).sum("2012Value");
			}
			var biggestExp = 0;
					for (var sumkey in exportSums) {
						if (exportSums.hasOwnProperty(sumkey)) {
							if ((exportSums[sumkey]>biggestExp) && sumkey!=0) {
								biggestExp = exportSums[sumkey];
								
							}
						}
					}	
			console.log(biggestExp)
			console.log(exportSums);
			return exportSums;
			*/
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
			});
		}

		//populates the results table based on db and state selection
		function populateResultsTable_by_country(selectedStates, HSarray) {
            
            var importResultsTable_by_country;
			var exportResultsTable_by_country;

			importResultsTable_by_country = searchDBByAbbr(importDestinationDB, selectedStates);
			exportResultsTable_by_country = searchDBByAbbr(exportDestinationDB, selectedStates);
			console.log('selectedStates: ')
			console.log(selectedStates)
			console.log('importResultsTable_by_country: ')
			console.log(importResultsTable_by_country)
			console.log('exportResultsTable_by_country: ')
			console.log(exportResultsTable_by_country)
		}
		function populateResultsTable_by_commody(selectedStates, HSarray) {
            
            var importResultsTable_by_commody;
			var exportResultsTable_by_commody;

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
		var selectedStates = $("#statesListbox_by_commody").val() || [];
		var HSarray = selected_HS6_Codes
        populateResultsTable_by_commody(selectedStates, HSarray)
    };
    
    // draw US map and query database when a state is clicked
	function drawRegionsMap() {
		var USMapStatesArray = [['City', 'Imports']];	
		/*
		//use when adding data to the states
		stateAbbreviationsDB().each(function (stateParam) {
			USMapStatesArray.push([stateParam.State, stateParam.Abbreviation]);
		});
		*/
		var dataset = google.visualization.arrayToDataTable(USMapStatesArray);		
		var USMapOptions = {};
		USMapOptions['displayMode'] = 'regions';
		USMapOptions['region'] = 'US';
		USMapOptions['resolution'] = 'provinces';
		var USChart = new google.visualization.GeoChart(document.getElementById('USchart_div'));
		//gets US map's selection
		function USMapHandler() {
			var selectedState = USChart.getSelection()[0];
			if (selectedState) {
				//var selectedStateAbbr = selectedState.substring(selectedState.indexOf('-'));
				console.log(selectedState);
			}
		};
		google.visualization.events.addListener(USChart, 'regionClick', function(eventData) {
			var selectedRegion = eventData.region;
			var selectedRegionAbbr = selectedRegion.substring(selectedRegion.indexOf('-')+1);
			var HSarray = selected_HS6_Codes;
			populateResultsTable_by_commody(selectedRegionAbbr, HSarray);
		});
		USChart.draw(dataset, USMapOptions);
	};