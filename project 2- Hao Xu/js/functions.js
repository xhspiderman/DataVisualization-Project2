/**
		 * search a database by state abbreviation
		 * @param searchDB {TAFFY} database to be searched
		 * @param abbrs {string[]} array of state abbreviations
		 * @return results[i=number of abbrs][j=number of results for each abbr]
		 */
		function searchDBByAbbr(searchDB, abbrs) {
			var results = [];
			for (i=0; i<abbrs.length; i++) {
				results.push(searchDB({StateAbbr:abbrs[i]}).get());
			}
			return results;
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
			console.log(distinctHSCodes);
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
			var select = document.getElementById("statesListbox");
			stateAbbreviationsDB().each(function (s) {
				select.options[select.options.length] = new Option(s.State, s.Abbreviation);
			});
		}

		//populates the results table based on db and state selection
		function populateResultsTable() {
			//get values of radio buttons and listbox
			var selectedStates = $("#statesListbox").val() || [];
			var selectedDB = $("input[name='dbRadio']:checked").val();
			var queryResults;
			//pass the database to the search function
			switch (selectedDB) {
				case "importDestinationRadio":
					queryResults = searchDBByAbbr(importDestinationDB, selectedStates);
					break;
				case "exportDestinationRadio":
					queryResults = searchDBByAbbr(exportDestinationDB, selectedStates);
					break;
					// Hao will be adding HScode filtering
				case "importTop25Radio":
					queryResults = searchDBByAbbr(importTop25DB, selectedStates);
					break;
				case "exportTop25Radio":
					queryResults = searchDBByAbbr(exportTop25DB, selectedStates);
					break;
				case "topUSExportsRadio":
					queryResults = topUSExports(50);
					break;
			}
			//clear table before repopulating
			$("#resultsTable tbody").empty();
			var newRow = $("#resultsTable tbody");
			for (i=0; i<queryResults.length; i++) {	
				//populate column headers
				for (var key in queryResults[i][0]) {
					if (queryResults[i][0].hasOwnProperty(key)) {
						newRow.append("<td>"+key+"</td>");
					}
				}
				//populate each row
				for (j=0; j<queryResults[i].length; j++) {
					newRow.append("<tr>");
					for (var key in queryResults[i][j]) {
						if (queryResults[i][j].hasOwnProperty(key)) {
							newRow.append("<td>"+queryResults[i][j][key]+"</td>");
						}
					}
					newRow.append("</tr>");
				}		
			}
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
		var selected_HS6_Codes = []
		// includeDetail = document.getElementById("includeDetail").checked
		includeDetail = document.getElementById("includeDetail").checked

		if(includeDetail){// code for detailed selection box
			for (var i in selectedValues){
				// derive HS6 code from HS6 code
				HS6({hs_code:{regex: regexgen(selectedValues[i],0)}}).each(function (record,recordnumber) {
                    selected_HS6_Codes.push({'hs_6': record.hs_code, 'description':record.description})
        		});
			}
		}
		else{// code for no-detail selection box
			for (var i in selectedValues){
        	// derive HS6 code from HS2 code
    		HS6({hs_code:{regex: regexgen(selectedValues[i],4)}}).each(function (record,recordnumber) {
                    selected_HS6_Codes.push({'hs_6': record.hs_code, 'description':record.description})
        		});
	        }
		}
	        // stringiy HS6 matrix and display them
        var x=document.getElementById("selected_HS_Code");
			x.innerHTML= JSON.stringify(selected_HS6_Codes);
			console.log(selected_HS6_Codes.length)
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
    }

    // collect selected datas
     function selectionUpdate() {

        selectedValues = $("#First_Level_Selection").multipleSelect("getSelects");
        var selectedTexts = $("#First_Level_Selection").multipleSelect("getSelects", "text");
        // $('#eventResult').html(selectedValues)
        HS6_Code_Update()
    };