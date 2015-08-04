(function(window, $, undefined) {
  'use strict';
  var appContext = $('[data-app-name="gene-app"]');

  // Only runs once Agave is ready
  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    // Will be used to store initialized DataTables
    var chromosomeTable,
    goTable;

    // Once the search button is clicked, retrieve the data
    //change to submit
    $('#searchButton').click(function() {

      // Reset UI
      $('#error', appContext).empty();

      // Inserts loading text, will be replaced by table
      console.log('loading');
      $('#gene_chromosome', appContext).html('<h2>Loading...</h2>');
      $('#gene_go', appContext).html('<h2>Loading...</h2>');

      // Saves user-input as a parameter
      var params = {
        'Identifier': $('input[name=gene_transcript-input]').val(),
        'Output': 'all'
      };

      // Calls API to retrieve chromosome data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'ichezhia-dev', service: 'gene_by_geneid_v0.2',
        queryParams: params},
        showChromosomeData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );
      console.log('adama');



      // Calls API to retrieve go data, using saved parameter
      Agave.api.adama.search(
        {namespace: 'ichezhia-dev', service: 'go_by_geneid_v0.2',
        queryParams: params},
        showgoData, // Displays retrieved data in a table
        showErrorMessage // Displays an error if Adama returns an exception
      );
    });


    // Creates a table to display chromosome data
    var showChromosomeData = function showChromosomeData(response) {
      // Stores API response
      var data = response.obj || response;
      data = data.result; // data.result contains an array of objects
      console.log('fghu');
      // Creates a base table that the data will be stored in
      $('#gene_chromosome', appContext).html(
        '<table width="100%" cellspacing="0" id="gene_chromosome-table"' +
        'class="table table-striped table-bordered table-hover">' +
        '<thead><th>Field</th><th>Result</th></thead>' +
        '<tbody id="gene_chromosome-data"></tbody></table>');

        // Add data to table
        var field = '<td>' + 'locus_id' + '</td>';
        var result = '<td>' + data[0].primaryIdentifier + '</td>';
        $('#gene_chromosome-data', appContext).append('<tr>' + field +
        result + '</tr>');

        field = '<td>' + 'chromosomeLocation.end' + '</td>';
        result = '<td>' + data[1].chromosomeLocation.end + '</td>';
        $('#gene_chromosome-data', appContext).append('<tr>' + field +
        result + '</tr>');

        field = '<td>' + 'chromosomeLocation.start' + '</td>';
        result = '<td>' + data[2].chromosomeLocation.start + '</td>';
        $('#gene_chromosome-data', appContext).append('<tr>' + field +
        result + '</tr>');



        // Converts normal table to DataTable
        chromosomeTable = $('#gene_chromosome-table', appContext).DataTable({
          oLanguage: { // Overrides default text to make it more specific to this app
            sSearch: 'Narrow results:',
            sEmptyTable: 'No chromosomeental phosphorylation data available for this transcript id.'
          },
          dom: 'Rlfrtip', // Allows for user to reorder columns
          stateSave: true // Saves the state of the table between loads
        });
      }
      // Creates a table to display go data
      var showgoData = function showgoData(response) {
        // Stores API response
        var data = response.obj || response;
        data = data.result; // data.result contains an array of objects
        // Creates a base table that the data will be stored in
        $('#gene_go', appContext).html(
          '<table id="gene_go-table" width="100%" cellspacing="0"' +
          'class="table table-striped table-bordered table-hover">' +
          '<thead><tr><th>Locus ID</th><th>Name</th>' +
          '<th>Def</th><th>Namespace</th><th>Evidence Code</th></tr></thead>' +
          '<tbody id="gene_go-data"></tbody></table>');
          // Loops through each JSON object in the data
          for (var i = 0; i < data.length; i++) {
            // Saves data in strings to later be added to table
            var locusID = '<td>' + data[i].locus_id + '</td>';
            var name = '<td>' + data[i].name + '</td>';
            var def = '<td>' + data[i].def '</td>';
            var namespace = '<td>' + data[i].namespace '</td>';
            var evidenceCode = '<td>' + data[i].evidence_code '</td>';

            // Dynamically adds saved data to the table
            $('#gene_go-data', appContext).append('<tr>' + locusID +
            name + def + namespace + evidenceCode + '</tr>');
          }

      };

        // Displays an error message if the API returns an error
        var showErrorMessage = function showErrorMessage(response) {
          console.log(response.obj.message);
          $('#gene_error', appContext).html(
            '<h4>API Error.' +
            'See below:</h4><div class="alert alert-danger" role="alert">' +
            response.obj.message + '</div>');

          };

        });

      })(window, jQuery);
