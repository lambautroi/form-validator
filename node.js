//tao hàm validator (đối tượng validator)
function validator(options) {
  //kiểm tra có match cái class đó ko
  // function getParent(element, selector) {
  //     while (element.parentElement) {
  //         if (element.parentElement.matches(selector)) {
  //             return element.parentElement;
  //         }
  //         element = element.parentElement;
  //     }
  // }

  //tạo ra 1 object trống để lưu trữ các rule
  var selectorRules = {};

  //lấy element của form cần validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    //lặp qua mỗi rule và xử lí ( lắng nghe sưk kiện blur , input, ...)
    //array.forEach(function(currentValue, index, arr))
    options.rules.forEach(function (rule) {
      //lưu lại các rule cho mỗi input
      //lưu kiểu này thì các rule sẽ bị ghi đè
      //selectorRules[rule.selector] = rule.test;
      if (Array.isArray(selectorRules[rule.selector])) {
        //mảng rỗng ko thể dùng push nên phải tạo ptu đầu tiên
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      // lấy ra inputelement from rule
      // rule = validator.isRequired
      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        // xử lí trường hợp blur khỏi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        // xử lí trường hợp nhấn vào input
        inputElement.onmousedown = function () {
          var errorElement = inputElement.parentElement;
          errorElement.querySelector('span').innerText = '';
          errorElement.classList.remove('invalid');
        };
      });
    });

    // xử lí nút input xóa hết tất cả
    var resetElement = formElement.querySelector(options.reset);
    resetElement.onmousedown = function () {
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var errorElement = inputElement.parentElement;
        errorElement.querySelector('span').innerText = '';
        errorElement.classList.remove('invalid');
        inputElement.value = '';
      });
    };

    // xử lí nút đăng kí (submit form)
    formElement.onsubmit = function (e) {
      e.preventDefault();
      //lấy dữ liệu nhập vào của người dùng
      var isFormValid = true;
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        // Trường hợp submit với javascript
        if (typeof options.onSubmit === 'function') {
          // lấy ra các thẻ input ( có name)
          var enableInputs = formElement.querySelectorAll('[name]');
          // biến cái nodeList thành 1 cái array
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case 'radio':
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;
              case 'checkbox':
                if (!input.matches(':checked')) {
                  values[input.name] = '';
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case 'file':
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          options.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };
  }

  //thực hiện func validate
  function validate(inputElement, rule) {
    var errorElement = formElement.querySelector(options.formGroup);
    //value : inputElement.value
    // test func : rule.test
    // lấy ra các rule của selector
    var rules = selectorRules[rule.selector];
    //lọc qua các rule và kiểm tra
    // nếu có lỗi thì dừng việc kiểm tra
    for (var i = 0; i < rules.length; ++i) {
      var errorMessage;
      switch (inputElement.type) {
        case 'checkbox':
        case 'radio':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.querySelector('span').innerText = errorMessage;
      errorElement.classList.add('invalid');
    } else {
      errorElement.querySelector('span').innerText = '';
      errorElement.classList.remove('invalid');
    }
    //nếu có lỗi thì trả về flase , nếu ko lỗi trả về true
    return Boolean(!errorMessage);
  }
}

// định nghĩa rules
//nguyên tắc các rules:
//1. khi có lỗi => trả ra cái message lỗi
//2. khi hợp lệ => không trả ra cái gì cả
validator.isRequired = function (selector, e) {
  return {
    selector: selector,
    test: function (value) {
      if (value) {
        return undefined;
      } else return e;
    },
  };
};

validator.isEmail = function (selector, e) {
  return {
    selector: selector,
    test: function (value) {
      var fomat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (fomat.test(value.trim())) {
        return undefined;
      } else return e;
    },
  };
};

validator.isPassword = function (selector, e) {
  return {
    selector: selector,
    test: function (value) {
      var fomat = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
      if (fomat.test(value)) {
        return undefined;
      } else return e;
    },
  };
};
validator.isConfirm = function (selector, getConfirmvalue, e) {
  return {
    selector: selector,
    test: function (value) {
      if (value === getConfirmvalue()) {
        return undefined;
      } else return e;
    },
  };
};
validator.isChecked = function (selector, e) {
  return {
    selector: selector,
    test: function (value) {
      if (value) return undefined;
      else return e;
    },
  };
};
