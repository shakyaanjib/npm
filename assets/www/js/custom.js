$(document).on("ready", function() {
//part0 - page initialization code
	$.mobile.touchOverflowEnabled = true;
	$("#mortgage_calc_page").load("mortgage.html");
	$("#mortgage_result_page").load("mortgage_result.html");
	$("#camera_page").load("camera.html");
	$("#feedback_page").load("feedback.html");
	$("#feedback_edit_page").load("feedback_edit.html");
	//var site_url = "http://k9nepal.com/npmarket";
	var site_url = "http://192.168.1.3";
	var device_width = parseFloat($(window).width())- 40;
	$(".property_type .ui-controlgroup-controls").css("width",device_width + "px");
//end of part0
	
//part1 - code to change range slider value to lakh
	$( ".range_left" ).on( 'change', function( event ) { 
	var num = $( ".range_left" ).val();
		if( num >= 100000){
			var num2 = num/100000;
			$( "#rval1" ).html(num2+' Lakh');
		}else{
			$( "#rval1" ).html(num);
		}
	});
	$( ".range_right" ).on( 'change', function( event ) { 
	var num = $( ".range_right" ).val();
		if( num >= 100000){
			var num2 = num/100000;
			$( "#rval2" ).html(num2+' Lakh');
		}else{
			$( "#rval2" ).html(num);
		}
	});
//end of part1
	
//part2 - search form submit function
	$("#sale_frm").on("submit",function(e){
	e.preventDefault();
	$.mobile.loading( 'show', {
	text: 'Searching..',
	textVisible: true,
	theme: 'b',
	html: ""
	});
	var postData = $(this).serialize();
	var url = site_url+"/pservice/index.php?method=property-sale";
		$.ajax({
			url : url,
			type: "GET",
			data : postData,
			success:function(data, textStatus, jqXHR)
			{
				loadPropertyList(data);
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	});
	
	function loadPropertyList(data){
	var listdata = data;
	var item  = "<li data-role='list-divider'>Property Available</li>";
	$.each( listdata, function( index, value ){
	item += "<li class='ui-li-has-thumb'><a href='#' class='ui-btn'>"+
                "<img src='"+value.featuredImage+"'>"+
                "<h2>"+value.bedrooms+" Bedroom</h2>"+
                "<p>"+value.propertyTitle+"</p>"+
                "<p class='ui-li-aside'><strong>Rs."+value.price+"</strong></p></a></li>";
	
	});
	$("#propertylist").html(item);
	setTimeout(function(){$.mobile.changePage('#searchlist_page', { transition: "slide"});},300);
	//$.mobile.changePage("#searchlist_page");
	
	}
//end of part2
	
//part3 - mortgage calculator code
	$("body").on("tap", "#mrt_btn",function(){
		var loan_amount = $("#loan_amount").val();
		var interest_rate = $("#interest_rate").val();
		var length_of_mortgage = $("#length_of_mortgage").val();
		var loan_period = $("#length_of_mortgage").val();
		if(loan_amount == "" || interest_rate == "" || length_of_mortgage == ""){
			// do nothing
		}else{
			loan_amount = parseFloat(loan_amount);
			interest_rate = parseFloat(interest_rate)/100;
			length_of_mortgage = parseInt(length_of_mortgage)*12;
			var monthly_interest_rate = interest_rate/12;
			
			// REFERENCE: P = L[c(1 + c)n]/[(1 + c)n - 1]
			var top_val = monthly_interest_rate * Math.pow((1+monthly_interest_rate),length_of_mortgage);
			var bot_val = Math.pow((1 + monthly_interest_rate),(length_of_mortgage))-1;
			var monthly_mortgage = parseFloat(loan_amount*(top_val/bot_val)).toFixed(2);
			
			var total_int = calculate_total_interest(loan_amount, monthly_mortgage, monthly_interest_rate, length_of_mortgage);
			
			$("body #loan_value").html(loan_amount);
			$("body #monthly_value").html(monthly_mortgage);
			$("body #interest_value").html(total_int);
			$("body #loan_period").html(loan_period);
			setTimeout(function(){$.mobile.changePage('#mortgage_result_page', { transition: "slide"});},300);
		}
		
	$("body").on("tap","#mresult_close", function(){
	$("body #mrt_calculator").trigger("reset");
	
	});
	
	});
	
	function calculate_total_interest(loan_amount, monthly_mortgage, monthly_interest_rate, length_of_mortgage) {
		var total_mortgage = parseFloat(0);
		var total_principal = parseFloat(0);
		var total_interest = parseFloat(0);
		
		for(i=length_of_mortgage; i>0; i--) {
			var monthly_interest = parseFloat(loan_amount * monthly_interest_rate).toFixed(2);
			var monthly_principal = parseFloat(monthly_mortgage - monthly_interest).toFixed(2);
			total_interest = parseFloat(total_interest) + parseFloat(monthly_interest);
			loan_amount = parseFloat(loan_amount - monthly_principal).toFixed(2);
			
			};
		
		return total_interest.toFixed(2);
	}
	
//end of part3

//part4- feedback list
	$("body").on("tap","#feedback_btn", function(){

	var postData = $("#feedback_frm").serialize();
	var url = site_url+"/pservice/index.php?method=feedback-add";
		$.ajax({
			url : url,
			type: "GET",
			data : postData,
			success:function(data, textStatus, jqXHR)
			{
				$("#load_feedback").click();
				$("body #feedback_frm").trigger("reset");
				alert("Feedback Added");
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	});
	
	$("#load_feedback").on("click",function(){
	
	var url = site_url+"/pservice/index.php?method=feedback-list";
		$.ajax({
			url : url,
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				loadFeedback(data);
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	
	});
	
	
	
	function loadFeedback(data){
	var listdata = data;
	var item  = "<li data-role='list-divider'>Feedback Lists</li>";
	$.each( listdata, function( index, value ){
	item += "<li class='ui-li-has-thumb'>"+
                "<h2>"+value.feedback_name+"</h2>"+
                "<p>"+value.feedback_content+"</p>"+
				"<p class='ui-li-aside'>"+
				"<a href='#feedback_edit_page' var='"+value.id+
				"' id='feedback_edit'><i class='lIcon fa fa-pencil fa-3x'></i></a>"+
				"<a href='#' var='"+value.id+
				"' id='feedback_delete'><i class='lIcon fa fa-trash fa-3x'></i></a>"+
                "</p></li>";
	
	});
	$("#feedbacklist").html(item);
	
	}
	
	$("body").on("tap","#feedback_delete", function(){
		var id = $(this).attr('var');
		var url = site_url+"/pservice/index.php?method=feedback-remove&delid="+id;
		$.ajax({
			url : url,
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				alert("Feedback deleted");
				$("#load_feedback").click();
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	});
	
	$("body").on("tap","#feedback_edit", function(){
		var id = $(this).attr('var');
		var url = site_url+"/pservice/index.php?method=feedback-single&id="+id;
		$.ajax({
			url : url,
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				$.each(data, function( index, value11 ){
				$("#feedback_edit_name").val(value11.feedback_name);
				$("#feedback_edit_content").val(value11.feedback_content);
				$("#feedback_edit_id").val(value11.id);
				});
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	});	
	
	$("body").on("tap","#feedback_edit_btn", function(){

	var postData = $("#feedback_edit_frm").serialize();
	var url = site_url+"/pservice/index.php?method=feedback-update";
		$.ajax({
			url : url,
			type: "GET",
			data : postData,
			success:function(data, textStatus, jqXHR)
			{
				$("#load_feedback").click();
				$("body #feedback_frm").trigger("reset");
				alert("Feedback Updated");
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				//if fails     
			}
		
		});
	});

//end of part4
	

	
    
});