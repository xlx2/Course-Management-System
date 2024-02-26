const ClassOverview = {
    props: ['todo'],
    template: '#classOverview',
    data() {
        return {
            token: ''

        }
    },
    methods: {

    },
    mounted() {
        console.log('组件ClassOverview被挂载了');
    },
    created() {

    }
};

const TestItems = {
    props: ['todo'],
    template: '#testItems',
    data() {
        return {
            token: ''

        }
    },
    methods: {

    },
    mounted() {
        console.log('组件TestItems被挂载了');
    },
    created() {

    }
};

const StudentGrades = {
    props: ['todo'],
    template: '#studentGrades',
    data() {
        //检验学号是否存在
        const rulesnumber = (rule, value, callback) => {
            if (this.isEdit) {
                callback();
            }
            let that = this;
            //使用Axios进行校验
            axios
                .post(that.baseURL + "number/check/",
                    {
                        number: value
                    })
                .then((res) => {
                    if (res.data.code === 1) {
                        if (res.data.exists) {
                            callback(new Error('学号已存在！'));
                        } else {
                            callback();
                        }
                    }
                })
                .catch((err) => {
                    console.log(err)
                    callback(new Error('校验学号后端出现异常！'));
                })
        }

        return {
            baseURL: 'http://172.20.10.2:8000/',
            students: [], //所有学生信息
            pageStudents: [], //当前页的学生信息
            total: 0, //数据总行数
            currentpage: 1, //当前页,
            pagesize: 12, //每页行数
            inputStr: "", //输入的查询条件
            dialogVisible: false, //表单是否显示
            selectStudents: [],//选择复选框时将选择记录保存
            studentForm: {
                major: '',
                number: '',
                stuClass: '',
                name: '',
                hw1: '',
                hw2: '',
                exp1: '',
                exp2: '',
                exp3: '',
            },
            isEdit: false,
            formTitle: "学生明细",
            rules: {
                major: [
                    { required: true, message: '此处不能为空', trigger: "blur" },
                    { pattern: /[\u4e00-\u9fa5]/, message: '内容需要是汉字', trigger: "blur" },
                ],
                number: [
                    { required: true, message: '此处不能为空', trigger: "blur" },
                    { pattern: /^\d{10}$/, message: '长度需为10位', trigger: "blur" },
                    { validator: rulesnumber, trigger: "blur" }//校验学号是否存在
                ],
                stuClass: [
                    { required: true, message: '此处不能为空', trigger: "blur" },
                    { pattern: /^\d{10}$/, message: '长度需为10位', trigger: "blur" },
                ],
                name: [
                    { required: true, message: '此处不能为空', trigger: "blur" },
                    { pattern: /[\u4e00-\u9fa5]/, message: '内容需要是汉字', trigger: "blur" },
                ],
            }
        }
    },
    mounted() {
        //自动挂载
        this.getStudents();
    },
    methods: {
        //获取所有学生信息
        getStudents() {
            //记录this的指针
            let that = this;
            //使用Axios实现Ajax请求
            axios
                .get(that.baseURL + 'students/')
                .then(function (res) {
                    //请求成功后执行的函数
                    if (res.data.code === 1) {
                        //把数据传给students
                        that.students = res.data.data;
                        //获取返回记录总数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //成功提示
                        that.$message({
                            message: '数据加载成功',
                            type: 'success'
                        });
                    }
                    else {
                        //失败提示
                        that.$message.error(res.data.msg);
                    }
                })
                .catch(function (err) {
                    //请求失败后执行的函数
                    console.log(err)
                });
        },
        //获取当前页的学生信息
        getPageStudents() {
            this.pageStudents = [];
            //获取当前页的学生信息
            for (let i = (this.currentpage - 1) * this.pagesize; i < this.total; i++) {
                this.pageStudents.push(this.students[i]);
                //判断是否达到一页的行数
                if (this.pageStudents.length === this.pagesize) {
                    break;
                }
            }
        },
        //上传Excel
        uploadExcelPost(file) {
            let that = this;
            //实例化一个formdata
            let fileReq = new FormData();
            fileReq.append('excel', file.file);
            console.log(fileReq)
            //发送Ajax请求
            axios({
                method: 'post',
                url: that.baseURL + 'excel/import/',
                data: fileReq
            })
                .then((res) => {
                    if (res.data.code === 1) {
                        //把数据传给students
                        that.students = res.data.data;
                        //获取返回记录总数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //弹出确定框
                        that.$alert('本次导入完成，成功：' + res.data.success + '失败：' + res.data.error, '导入结果展示', {
                            confirmButtonText: '确定'
                        });

                    } else {
                        that.$message.error(res.data.msg)
                    }
                })
                .catch((err) => {
                    console.log(err);
                    that.$message.error("Excel添加学生信息时获取后端学生信息失败!")
                })
        },
        //下载Excel
        downloadExcel(file) {
            let that = this;
            axios
                .get(that.baseURL + 'excel/export/',)
                .then((res) => {
                    if (res.data.code === 1) {
                        let url = that.baseURL + 'media/' + res.data.name;
                        window.open(url);
                    } else {
                        that.$message.error('导出Excel出现异常!')
                    }
                })
                .catch((err) => {
                    console.log(err);
                    that.$message.error("Excel导出学生信息时获取后端学生信息失败!")
                })
        },
        // 调整当前页码
        handleCurrentChange(pageNumber) {
            this.currentpage = pageNumber;
            this.getPageStudents();
        },
        //学生信息的查询
        queryStudents() {
            let that = this;
            // 使用Ajax请求POST传递inputStr
            if (that.inputStr.length === 0) {
                //失败提示
                that.$message.error("输入查询条件为空！");
            } else {
                axios
                    .post(that.baseURL + "students/query/",
                        {
                            inputstr: that.inputStr
                        })
                    .then(function (res) {
                        if (res.data.code === 1) {
                            //把数据传给students
                            that.students = res.data.data;
                            //获取返回记录总数
                            that.total = res.data.data.length;
                            //获取当前页的数据
                            that.getPageStudents();
                            //成功提示
                            that.$message({
                                message: '查询数据成功',
                                type: 'success'
                            });
                        } else {
                            //失败提示
                            that.$message.error(res.data.msg);
                        }
                    })
                    .catch(function (err) {
                        console.log(err)
                        //失败提示
                        that.$message.error("查询后端结果出现异常！");
                    })
            }
        },
        //获取全部学生信息
        getAllStudents() {
            //清空查询条件
            this.inputStr = "";
            //获取所有学生信息
            this.getStudents();
        },
        //添加按键事件
        addStudent() {
            this.dialogVisible = true;
            this.formTitle = "添加学生明细";

        },
        //编辑学生信息按键事件
        editStudent(row) {
            //打开对话框
            this.dialogVisible = true;
            //深拷贝
            this.studentForm = JSON.parse(JSON.stringify(row));
            this.isEdit = true;
            this.formTitle = "编辑学生明细";
        },
        //提交学生表单
        submitStudentForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if (this.isEdit) {
                        this.submitStudentEdit();
                    } else {
                        this.submitStudentAdd();
                    }

                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //学生表单添加
        submitStudentAdd() {
            let that = this;
            axios
                .post(that.baseURL + "students/add/", that.studentForm)
                .then((res) => {
                    if (res.data.code === 1) {
                        //把数据传给students
                        that.students = res.data.data;
                        //获取返回记录总数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //成功提示
                        that.$message({
                            message: '数据加载成功',
                            type: 'success'
                        });
                        //关闭对话框
                        that.closeDialogForm('studentForm');
                    } else {
                        that.$message.error(res.data.msg)
                    }

                })
                .catch((err) => {
                    console.log(err);
                    that.$message.error("添加学生信息时获取后端学生信息失败！")
                });
        },
        //学生表单修改
        submitStudentEdit() {
            let that = this;
            axios
                .post(that.baseURL + "students/edit/", that.studentForm)
                .then((res) => {
                    if (res.data.code === 1) {
                        //把数据传给students
                        that.students = res.data.data;
                        //获取返回记录总数
                        that.total = res.data.data.length;
                        //获取当前页的数据
                        that.getPageStudents();
                        //成功提示
                        that.$message({
                            message: '数据加载成功',
                            type: 'success'
                        });
                        //关闭对话框
                        that.closeDialogForm('studentForm');
                    } else {
                        that.$message.error(res.data.msg)
                    }

                })
                .catch((err) => {
                    console.log(err);
                    that.$message.error("修改学生信息时获取后端学生信息失败！")
                });
        },
        //删除一条学生信息
        deleteStudent(row) {
            this.$confirm('请确定是否删除学生信息【姓名：' + row.name + '\t学号：' + row.number + '】?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除
                let that = this;
                axios
                    .post(that.baseURL + "students/delete/",
                        {
                            number: row.number
                        })
                    .then((res) => {
                        if (res.data.code === 1) {
                            //把数据传给students
                            that.students = res.data.data;
                            //获取返回记录总数
                            that.total = res.data.data.length;
                            //获取当前页的数据
                            that.getPageStudents();
                            //成功提示
                            that.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                        } else {
                            that.$message.error(res.data.msg)
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        that.$message.error("删除学生信息时获取后端学生信息失败！")
                    });
            }).catch(() => {
                //取消删除
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //批量删除学生信息
        deleteStudents() {
            this.$confirm('请确定是否删除这' + this.selectStudents.length + '名学生信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //确认删除
                let that = this;
                axios
                    .post(that.baseURL + "students/deleteStudents/",
                        {
                            students: that.selectStudents
                        })
                    .then((res) => {
                        if (res.data.code === 1) {
                            //把数据传给students
                            that.students = res.data.data;
                            //获取返回记录总数
                            that.total = res.data.data.length;
                            //获取当前页的数据
                            that.getPageStudents();
                            //成功提示
                            that.$message({
                                message: '批量删除成功',
                                type: 'success'
                            });
                        } else {
                            that.$message.error(res.data.msg)
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        that.$message.error("批量删除学生信息时获取后端学生信息失败！")
                    });
            }).catch(() => {
                //取消删除
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        //关闭对话框
        closeDialogForm(formName) {
            //重置表单校验
            this.$refs[formName].resetFields();
            //清空表单内容
            this.studentForm = {
                major: '',
                number: '',
                stuClass: '',
                name: '',
                hw1: '',
                hw2: '',
                exp1: '',
                exp2: '',
                exp3: ''
            }
            //关闭对话框
            this.dialogVisible = false;
            //初始化编辑状态
            this.isEdit = false;
        },

        //选择复选框时触发的操作
        handleSelectionChange(data) {
            this.selectStudents = data;
        },
    },
    created() {

    }
};

const ReportProducing = {
    props: ['todo'],
    template: '#reportProducing',
    data() {
        return {
            token: ''

        }
    },
    methods: {

    },
    mounted() {
        console.log('组件ReportProducing被挂载了');
    },
    created() {

    }
};

const router = new VueRouter({
    routes: [
        {
            path: '/classOverview',
            component: ClassOverview,
        },
        {
            path: '/testItems',
            component:TestItems,
        },
        {
            path: '/studentGrades',
            component: StudentGrades,
        },
        {
            path: '/reportProducing',
            component: ReportProducing,
        },
    ]
});

const app = new Vue({
    router,
    el: '#app',
        data: {

        },
        methods: {

        }

})
