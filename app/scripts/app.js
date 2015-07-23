(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="gene-app"]');

  // Only runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Will be used to store initialized DataTables
    var experimentalTable,
        predictedTable,
        hotspotTable;

    // Once the search button is clicked, retrieve the data
    //change to submit
    $('#searchButton').click(function() {

      // Resets UI elements.
      $('#phosphat_protein-seq-cont', appContext).hide();
      $('#error', appContext).empty();

      // Inserts loading text, will be replaced by table
      $('#phosphat_experimental', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_predicted', appContext).html('<h2>Loading...</h2>');
      $('#phosphat_hotspots', appContext).html('<h2>Loading...</h2>');

      // Saves user-input as a parameter
      var params = {
        transcript_id: $('input[name=phosphat_transcript-input]').val()
      };

      // Calls API to retrieve experimental data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_experimental_v0.2',
         queryParams: params},
        showExperimentalData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Calls API to retrieve predicted data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_predicted_v0.2',
         queryParams: params},
        showPredictedData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Calls API to retrieve hotspot data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'phosphat', service: 'phosphorylated_hotspots_v0.2',
         queryParams: params},
        showHotspotData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception.
      );
    });


    // Creates a table to display experimental data
    var showExperimentalData = function showExperimentalData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Displays protein sequence
      if (data.length > 0) {
        $('#phosphat_protein-seq', appContext).html(data[0].protein_sequence);
        $('#phosphat_protein-seq-cont', appContext).show();
      }

      // Creates a base table that the data will be stored in
      $('#phosphat_experimental', appContext).html(
        '<table width="100%" cellspacing="0" id="phosphat_experimental-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Peptide Sequence</th><th>Position</th>' +
        '<th>Modification Type</th><th>Mass</th></tr></thead>' +
        '<tbody id="phosphat_experimental-data"></tbody></table>');


      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var peptideSeq = '<td>' + data[i].peptide_sequence + '</td>';
        var peptidePos = '<td>' + data[i].position_in_peptide + '</td>';
        var modType = '<td>' + data[i].modification_type + '</td>';
        // Checks to see if a mass was provided, if so round it.
        var peptideMass;
        if (data[i].mass !== '') {
          peptideMass = '<td>' + parseFloat(data[i].mass).toFixed(3) + '</td>';
        } else {
          peptideMass = '<td>' + 'not provided' + '</td>';
        }

        // Dynamically adds saved data to the table
        $('#phosphat_experimental-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + peptideMass + '</tr>');
      }

      // Converts normal table to DataTable
      experimentalTable = $('#phosphat_experimental-table', appContext).DataTable({
        oLanguage: { // Overrides default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No experimental phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allows for user to reorder columns
        stateSave: true // Saves the state of the table between loads
      });

      // Add the number of rows to the tab name
    $('#exp_num_rows', appContext).html(' (' + experimentalTable.data().length + ')');


    };

    // Creates a table to display predicted data
    var showPredictedData = function showPredictedData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Creates a base table that the data will be stored in
      $('#phosphat_predicted', appContext).html(
        '<table id="phosphat_predicted-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="phosphat_predicted-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        // Rounds number
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';

        // Dynamically adds saved data to the table
        $('#phosphat_predicted-data', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Converts normal table to DataTable
        predictedTable = $('#phosphat_predicted-table', appContext).DataTable({
        oLanguage: { // Overrides default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No predicted phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allows for user to reorder columns
        stateSave: true // Saves the state of the table between loads
      });

      // Add the number of rows to the tab name
      $('#pred_num_rows', appContext).html(' (' + predictedTable.data().length + ')');
    };

    // Creates a table to display hotspot data
    var showHotspotData = function showHotspotData(response) {

      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Creates a base table that the data will be stored in
      $('#phosphat_hotspots', appContext).html(
        '<table id="phosphat_hotspot-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="phosphat_hotspot-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';

        // Dynamically adds saved data to the table
        $('#phosphat_hotspot-data', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Converts normal table to DataTable
      hotspotTable = $('#phosphat_hotspot-table', appContext).DataTable({
        oLanguage: { // Overrides default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No hotspot data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allows for user to reorder columns
        stateSave: true // Saves the state of the table between loads
      });

      // Add the number of rows to the tab name
      $('#hot_num_rows', appContext).html(' (' + hotspotTable.data().length + ')');
    };

    // Displays an error message if the API returns an error
    var showErrorMessage = function showErrorMessage(response) {
      $('#phosphat_error', appContext).html(
          '<h4>There was an error retrieving your data from the server. ' +
          'See below:</h4><div class="alert alert-danger" role="alert">' +
           response.obj.message + '</div>');

    };

  });
})(window, jQuery);
