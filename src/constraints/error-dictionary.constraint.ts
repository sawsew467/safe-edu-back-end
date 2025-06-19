export enum ERRORS_DICTIONARY {
	// AUTH
	EMAIL_EXISTED = 'ATH_0091',
	WRONG_CREDENTIALS = 'ATH_0001',
	CONTENT_NOT_MATCH = 'ATH_0002',
	UNAUTHORIZED_EXCEPTION = 'ATH_0011',

	// TOPIC
	TOPIC_NOT_FOUND = 'Topic không tồn tại',

	//ADMIN
	ADMIN_EMAIL_IS_EXIST = 'Email đã tồn tại',
	ADMIN_PHONE_NUMBER_IS_EXIST = 'SĐT đã tồn tại',

	// USER
	USER_NOT_FOUND = 'Người dùng không tồn tại',
	USERNAME_EXISTS = 'username đã tồn tại',
	PASSWORD_NOT_MATCHED = 'Mật khẩu không đúng',

	// CITIZEN
	CITIZEN_PHONE_NUMBER_EXISTS = 'Số điện thoại đã tồn tại',
	CITIZEN_NAME_IS_NULL = 'Tên người dân không được để trống',
	CITIZEN_NOT_FOUND = 'Người dân không tồn tại',

	//STUDENT
	STUDENT_PHONE_NUMBER_EXISTS = 'Số điện thoại đã tồn tại',
	STUDENT_NAME_IS_NULL = 'Tên học sinh không được để trống',
	STUDENT_NOT_FOUND = 'Học sinh không tồn tại',
	STUDENT_PASSWORD_SAME = 'Mật khẩu mới không được giống mật khẩu cũ',
	STUDENT_PASSWORD_INCORRECT = 'Mật khẩu cũ không chính xác',
	USER_NOT_ACTIVE = 'Tài khoản đang bị khóa',

	//ORGANIZATION
	ORGANIZATION_NAME_EXISTS = 'Tên trường đã tồn tại',
	ORGANIZATION_NAME_NOT_FOUND = 'Tên trường không tồn tại',
	ORGANIZATION_NAME_CAN_NOT_BE_EMPTY = 'Tên trường không được để trống',
	ORGANIZATION_PROVINCE_CAN_NOT_BE_EMPTY = 'Tên tình/ thành phố không được để trống',
	ORGANIZATION_NOT_FOUND = 'Trường không tồn tại',
	ORGANIZATION_SLUG_ALREADY_EXIST = 'Tên slug đã tồn tại',

	// CLASS VALIDATOR
	VALIDATION_ERROR = 'Lỗi Validate',

	//SUPERVISOR
	SUPERVISOR_EMAIL_EXIST = 'Email đã tồn tại',
	SUPERVISOR_NOT_EXIST = 'Supervisor không tồn tại',
	SUPERVISOR_ALREADY_ASSIGN = 'Supervisor đã được đăng kí quản lí trường này',
	SUPERVISOR_NAME_IS_NULL = 'Tên không được để trống',

	//PROVINCE
	PROVINCE_NOT_FOUND = 'Tên tỉnh thành không tồn tại',

	//COMPETITION
	COMPETITION_IS_EXIST = 'Tên cuộc thi đã tồn tại',
	INVALID_END_DATE = 'Ngày kết thúc cuộc thi không hợp lệ',

	//MANAGER
	MANAGER_NOT_FOUND = 'Email người quản lí không tồn tại',

	//Question
	QUESTION_NOT_FOUND = 'câu hỏi không tồn tại',
}
