


$(document).ready(function(){

    $('form').on('submit', function(e){

        console.log("Form submitted!"); 
        
        e.preventDefault();
        var itemInput = $('form input');
        var priorityInput = $('#priorityInput');
        var dateInput = $('#dateInput'); // This is a DOM element
        var categoryInput = $('#category'); // Get the category input
        var newTodoText = itemInput.val().trim();
        var newTodoPriority = priorityInput.val();
        var newTodoDueDate = dateInput.val(); // Get the value of the date input
        var newTodoCategory = categoryInput.val(); // Get the category value
          
    
        if (newTodoText === "") {
            alert("Please enter a todo item.");
            return;
        }

        var existingTodos = $('#todoList li .todo-item')
            .map(function(){
                return $(this).text().trim();
            })
            .get();

        if (existingTodos.includes(newTodoText)) {
            alert("This todo item already exists!");
            itemInput.val('');
            return;
        }
        

        var todo = { item: newTodoText,  priority: newTodoPriority, dueDate: newTodoDueDate, category: newTodoCategory };

        $.ajax({
            type: 'POST',
            url: '/todo',
            data: todo,
            success: function(data){
                location.reload();
            },
            error: function(xhr, status, error){
                console.error("Error adding todo:", error);
                alert("Failed to add todo. Please try again.");
            }
        });
    });

    $('.trash-btn').on('click', function(){
        var button = $(this);
        var todoId = button.closest('li').data('id');
        $.ajax({
            type: 'DELETE',
            url: '/todo/' + todoId,
            success: function(data){
                button.closest('li').remove();
            },
            error: function(xhr, status, error){
                console.error("Error deleting todo:", error);
                alert("Failed to delete todo. Please try again.");
            }
        });
    });

    $('#filterOption').on('change', function(){
    console.log("Filter option changed!");
    const selectedFilter = $(this).val();
    const todoItems = $('#todoList li');

    todoItems.each(function(){
        const $this = $(this);
        const isCompleted = $this.hasClass('completed');
        const priority = $this.find('.todo-priority').data('priority');
        const category = $this.find('.todo-category').data('category');

        let shouldShow = false;

        switch (selectedFilter) {
            case 'all':
                shouldShow = true;
                break;
            case 'completed':
                shouldShow = isCompleted;
                break;
            case 'uncompleted':
                shouldShow = !isCompleted;
                break;
            case 'high-priority':
                shouldShow = priority === 'high';
                break;
            case 'medium-priority':
                shouldShow = priority === 'medium';
                break;
            case 'low-priority':
                shouldShow = priority === 'low';
                break;
            case 'work':
                shouldShow = category === 'work';
                break;
            case 'shopping':
                shouldShow = category === 'shopping';
                break;
            case 'briefing':
                shouldShow = category === 'briefing';
                break;
            case 'personal':
                shouldShow = category === 'personal';
                break;
            case 'other':
                shouldShow = category === 'other';
                break;
            default:
                shouldShow = true;
        }

        $this.css('display', shouldShow ? 'flex' : 'none');
    });
});



   /* $('#filterOption').on('change', function(){
        console.log("Complete button was clicked!")// this is for troubleshooting in  browser console
        console.log("Filter option changed!");// this is also for truobleshooting in browser console
        const selectedFilter = $(this).val();
        const todoItems = $('#todoList li');
        console.log("Number of todo items found:", todoItems.length); // Check the count

        todoItems.each(function(){
            const $this = $(this); // Cache the jQuery object
            const isCompleted = $this.hasClass('completed');
            const priority = $this.find('.todo-priority').data('priority');
            const category = $this.find('.todo-category').data('category');
            console.log("Is item completed?", isCompleted); // Check this value
            console.log("Selected filter:", selectedFilter); // ADD THIS LINE
            console.log("Item priority:", priority);       // ADD THIS LINE
        

            switch (selectedFilter) {
                case 'all':
                    $this.css('display', 'flex');
                    break;
                case 'completed':
                    if (isCompleted) {
                        $this.css('display', 'flex');
                    } else {
                        $this.css('display', 'none');
                    }
                    break;
                case 'uncompleted':
                    if (!isCompleted) {
                        $this.css('display', 'flex');
                    } else {
                        $this.css('display', 'none');
                    }
                    break;
                case 'high-priority':
                    if (priority === 'high') {
                        $this.css('display', 'flex');
                    } else {
                        $this.css('display', 'none');
                    }
                    break;
                case 'medium-priority':
                    if (priority === 'medium') {
                        $this.css('display', 'flex');
                    } else {
                        $this.css('display', 'none');
                    }
                    break;
                case 'low-priority':
                    if (priority === 'low') {
                        $this.css('display', 'flex');
                    } else {
                        $this.css('display', 'none');
                    }
                    break;
                }
        });
    });*/

   
//fUNCTION TO HANDLE SORTING CONTAINER
    $('#sortOption').on('change', function(){
        console.log("Sort option changed!"); // Add this line
        const selectedSort = $(this).val();
        const todoList = $('#todoList');
        const todoItems = todoList.children('li').get();

        todoItems.sort(function(a, b) {
            const priorityA = $(a).find('.todo-priority').data('priority');
            const priorityB = $(b).find('.todo-priority').data('priority');

            const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };

            const priorityValueA = priorityOrder[priorityA];
            const priorityValueB = priorityOrder[priorityB];
            console.log("Priority A:", priorityA, "Value A:", priorityValueA); 
            console.log("Priority B:", priorityB, "Value B:", priorityValueB); 

            if (selectedSort === 'high-to-low') {
                return priorityValueB - priorityValueA;
            } else if (selectedSort === 'low-to-high') {
                return priorityValueA - priorityValueB;
            } else {
                return 0;
            }
        });

        $.each(todoItems, function(index, item) {
            todoList.append(item);
        });
    });

// FUNCTION TO HANDLE COMPLETE BUTTON
    $('.complete-btn').on('click', function(){
        console.log("Complete button was clicked!"); // this line for testing OR TROUBLESHOOTING
        var todoId = $(this).closest('li').data('id');
        $(this).closest('li').toggleClass('completed');
    });

    //$('#todoList').on('click', '.complete-btn', function(){
       // var todoId = $(this).closest('li').data('id');
       // $(this).closest('li').toggleClass('completed');
   // });
});

//function for calender , client not to select previous dates
    $(document).ready(function() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            const today = new Date();
            const year = today.getFullYear();
            let month = today.getMonth() + 1; // Month is 0-indexed
            let day = today.getDate();

            // Pad month and day with leading zero if needed
            month = month < 10 ? '0' + month : month;
            day = day < 10 ? '0' + day : day;

            const todayFormatted = `${year}-${month}-${day}`;
            dateInput.min = todayFormatted;
        }

    
    });
