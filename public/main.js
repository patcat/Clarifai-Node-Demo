var baseUrl = window.location.origin,
    dropArea = document.getElementById("dropArea");

dropArea.addEventListener("drop", imageDropped, false);

function imageDropped(evt) {
  evt.stopPropagation();
  evt.preventDefault(); 

  var imageHTML = evt.dataTransfer.getData("text/html"),
      dataParent = $("<div>").append(imageHTML),
      imageRequested = $(dataParent).find("img").attr("src"),
      $imageFound = $("#imageFound");
  
  console.log(imageRequested);

  $imageFound.attr("src", imageRequested);

  $.ajax({
    type: "POST",
    url: baseUrl + "/examineImage",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify({"imageRequested": imageRequested}),

    success: function(data) {
      console.log(data);
      var tags = "";
      for (var i = 0; i < data.length; i++) {
        tags += data[i];
        if (i != data.length - 1) tags += ", ";
      }
      $(dropArea).html(tags);
    },
    error: function() {
      console.log("We had an error!");
    }
  });
}