(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="gene-app"]');

  // Only runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Will be used to store initialized DataTables
    var chromosomeTable,
        predictedTable,
        hotspotTable;

    // Once the search button is clicked, retrieve the data
    //change to submit
    $('#searchButton').click(function() {

      // Reset UI
      $('#error', appContext).empty();

      // Inserts loading text, will be replaced by table
      $('#gene_chromosome', appContext).html('<h2>Loading...</h2>');
      $('#gene_go', appContext).html('<h2>Loading...</h2>');
      $('#gene_phenotype', appContext).html('<h2>Loading...</h2>');

      // Saves user-input as a parameter
      var params = {
        transcript_id: $('input[name=gene_transcript-input]').val()
      };

      // Calls API to retrieve chromosome data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'gene', service: 'gene_by_geneid_v0.2.1',
         queryParams: params},
        showChromosomeData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Calls API to retrieve predicted data, using saved parameter
      Agave.api.adama.search(
        //TODO
        {namespace: 'gene', service: 'phosphorylated_predicted_v0.2',
         queryParams: params},
        showPredictedData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );

      // Calls API to retrieve hotspot data, using saved parameter
      Agave.api.adama.search(
        //TODO
        {namespace: 'gene', service: 'phosphorylated_hotspots_v0.2',
         queryParams: params},
        showHotspotData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception.
      );
    });


    // Creates a table to display chromosome data
    var showChromosomeData = function showChromosomeData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Creates a base table that the data will be stored in
      $('#gene_chromosome', appContext).html(
        '<table width="100%" cellspacing="0" id="gene_chromosome-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Field</th><th>Result</th>' +
        '<tbody id="gene_chromosome-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var field = '<td>' + data[i].peptide_sequence + '</td>';
        var result = '<td>' + data[i].position_in_peptide + '</td>';
        // Checks to see if a mass was provided, if so round it.
        var peptideMass;
        if (data[i].mass !== '') {
          peptideMass = '<td>' + parseFloat(data[i].mass).toFixed(3) + '</td>';
        } else {
          peptideMass = '<td>' + 'not provided' + '</td>';
        }

        // Dynamically adds saved data to the table
        $('#gene_chromosome-data', appContext).append('<tr>' + peptideSeq +
        peptidePos + modType  + peptideMass + '</tr>');
      }

      // Converts normal table to DataTable
      chromosomeTable = $('#gene_chromosome-table', appContext).DataTable({
        oLanguage: { // Overrides default text to make it more specific to this app
          sSearch: 'Narrow results:',
          sEmptyTable: 'No chromosomeental phosphorylation data available for this transcript id.'
        },
        dom: 'Rlfrtip', // Allows for user to reorder columns
        stateSave: true // Saves the state of the table between loads
      });

      // Add the number of rows to the tab name
    $('#exp_num_rows', appContext).html(' (' + chromosomeTable.data().length + ')');

    };

#TODO
    // Creates a table to display predicted data
    var showPredictedData = function showPredictedData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Creates a base table that the data will be stored in
      $('#gene_predicted', appContext).html(
        '<table id="gene_predicted-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Protein Position</th><th>13-mer Sequence</th>' +
        '<th>Prediction Score</th></tr></thead>' +
        '<tbody id="gene_predicted-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var proteinPos = '<td>' + data[i].position_in_protein + '</td>';
        var sequence = '<td>' + data[i].thirteen_mer_sequence + '</td>';
        // Rounds number
        var predictionScore = '<td>' + parseFloat(data[i].prediction_score).toFixed(4) + '</td>';

        // Dynamically adds saved data to the table
        $('#gene_predicted-data', appContext).append('<tr>' + proteinPos +
        sequence + predictionScore + '</tr>');
      }

      // Converts normal table to DataTable
        predictedTable = $('#gene_predicted-table', appContext).DataTable({
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

//TODO
    // Creates a table to display hotspot data
    var showHotspotData = function showHotspotData(response) {

      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects

      // Creates a base table that the data will be stored in
      $('#gene_hotspots', appContext).html(
        '<table id="gene_hotspot-table" width="100%" cellspacing="0"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><tr><th>Start Position</th><th>End Position</th>' +
        '<th>Hotspot Sequence</th></tr></thead>' +
        '<tbody id="gene_hotspot-data"></tbody></table>');

      // Loops through each JSON object in the data
      for (var i = 0; i < data.length; i++) {
        // Saves data in strings to later be added to table
        var start = '<td>' + data[i].start_position + '</td>';
        var end = '<td>' + data[i].end_position + '</td>';
        var sequence = '<td>' + data[i].hotspot_sequence + '</td>';

        // Dynamically adds saved data to the table
        $('#gene_hotspot-data', appContext).append('<tr>' + start +
        end + sequence + '</tr>');
      }

      // Converts normal table to DataTable
      hotspotTable = $('#gene_hotspot-table', appContext).DataTable({
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
      $('#gene_error', appContext).html(
          '<h4>There was an error retrieving your data from the server. ' +
          'See below:</h4><div class="alert alert-danger" role="alert">' +
           response.obj.message + '</div>');

    };

  });
})(window, jQuery);
