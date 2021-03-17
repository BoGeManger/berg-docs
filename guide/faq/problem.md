# 常见问题

## 1. 分页组件失效
正确使用示例：
``` java
    /**
     * 获取列表分页
     * @param input
     * @return
     */
    public PageInfo<Test1> page(PageInVo input){
        return test1Dao.page(input,()->{
            return test1Dao.list();
        });
    }
```
错误使用示例：
``` java
    /**
     * 获取列表分页
     * @param input
     * @return
     */
    public PageInfo<Test1> page(PageInVo input){
        //TODO 期望对表Test1的数据查询进行分页，并通过Test2的数据查询进行数据转换；结果由于先对Test2进行了数据查询导致对Test2进行了分页。
        return test1Dao.page(input,()->{
            List<Test2> test2List = test2Dao.list();
            List<Test1> test1List =  test1Dao.list();
            test1List.forEach(test1->{
                test2List.stream().filter(j->test1.getId().equals(j.getId())).findAny().ifPresent(test2->{
                    test1.setName(test2.getName());
                });
            });
            return test1List;
        });
    }
```
分页统一使用PageHelper实现：
 * 推荐<u>使用Dao层封装方法</u>，已对多数据源及数据转换做了处理；
 * PageHelper底层使用ThreadLocal和Mybatis拦截器，并且增加Page对象继承实现了List，从而实现对数据库查询进行分页，因此<u>首次数据库查询</u>才会自动分页，第二次数据查询将不再分页，需将需要分页的数据查询放在首位；


## 2. 使用事务切换数据源失效
外部调用正确使用示例：
``` java
/**
 * 场景：通过调用main方法操作数据库system1表Test1，并且调用Test2Service saveTest2方法操作数据库system2表Test2
 */
@Service
public class Test1Service{

    @Autowired
    Test1Dao test1Dao;

    @Autowired
    Test2Service test2Service;

    /**
     * 主方法
     */
    @DS("system1")
    @Transactional
    public void main(){
        test2Service.saveTest2();//外部调用另一个数据库
        //保存数据库system1表Test1
        Test1 test1 = new Test1();
        test1.setId(0);
        test1.setName("test1");
        test1.setCreateTime(LocalDateTime.now());
        test1.setCreateUser("admin");
        test1.setModifyTime(LocalDateTime.now());
        test1.setModifyUser("admin");
        test1.setDelTime(LocalDateTime.now());
        test1.setDelUser("");
        test1.setIsdel(0);
        test1Dao.save(test1);
    }
    
}

@Service
public class Test2Service{

    @Autowired
    Test2Dao test2Dao;

    /**
     * 保存数据库system2表Test2
     */
    @DS("system2")
    @Transactional(propagation= Propagation.REQUIRES_NEW)
    public void saveTest2(){
        Test2 test2 = new Test2();
        test2.setId(0);
        test2.setName("test2");
        test2.setCreateTime(LocalDateTime.now());
        test2.setCreateUser("admin");
        test2.setModifyTime(LocalDateTime.now());
        test2.setModifyUser("admin");
        test2.setDelTime(LocalDateTime.now());
        test2.setDelUser("");
        test2.setIsdel(0);
        test2Dao.save(test2);
    }
    
    //NOT_SUPPORTED属性示例
//    @Transactional(propagation= Propagation.NOT_SUPPORTED)
//    public void saveTest2(){
//        Test2 test2 = new Test2();
//        test2.setId(0);
//        test2.setName("test2");
//        test2.setCreateTime(LocalDateTime.now());
//        test2.setCreateUser("admin");
//        test2.setModifyTime(LocalDateTime.now());
//        test2.setModifyUser("admin");
//        test2.setDelTime(LocalDateTime.now());
//        test2.setDelUser("");
//        test2.setIsdel(0);
//        test2Dao.save(test2);
//    }

}
```
内部调用正确使用示例：
``` java
/**
 * 场景：通过main方法操作数据库system1表Test1，并且调用内部saveTest2方法操作数据库system2表Test2
 */
@Service
public class Test1Service{

    @Autowired
    Test1Dao test1Dao;
    @Autowired
    Test2Dao test2Dao;

    /**
     * 主方法
     */
    @DS("system1")
    @Transactional
    public void main(){
        //开启线程调用内部方法
        new Thread(()->saveTest2()).start();
        
        //线程异步回调示例
//        FutureTask<Integer> futureTask = new FutureTask(()->{return 1;});
//        new Thread(futureTask).start();
//        try{
//            futureTask.get();
//        }catch (Exception ex){
//            throw new FailException("调用数据库操作失败");
//        }

        //线程池示例
//        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(1, 2,
//                0L, TimeUnit.MILLISECONDS,
//                new ArrayBlockingQueue<>(2));
//        threadPoolExecutor.execute(()->saveTest2());
//        threadPoolExecutor.shutdown();

        //保存数据库system1表Test1
        Test1 test1 = new Test1();
        test1.setId(0);
        test1.setName("test1");
        test1.setCreateTime(LocalDateTime.now());
        test1.setCreateUser("admin");
        test1.setModifyTime(LocalDateTime.now());
        test1.setModifyUser("admin");
        test1.setDelTime(LocalDateTime.now());
        test1.setDelUser("");
        test1.setIsdel(0);
        test1Dao.save(test1);
    }

    /**
     * 保存数据库system2表Test2
     */
    void saveTest2(){
        Test2 test2 = new Test2();
        test2.setId(0);
        test2.setName("test2");
        test2.setCreateTime(LocalDateTime.now());
        test2.setCreateUser("admin");
        test2.setModifyTime(LocalDateTime.now());
        test2.setModifyUser("admin");
        test2.setDelTime(LocalDateTime.now());
        test2.setDelUser("");
        test2.setIsdel(0);
        test2Dao.save(test2);
    }
    
}
```
手动调用事务正确使用示例：
``` java
@Service
public class Test1Service{

    @Autowired
    Test1Dao test1Dao;
    @Autowired
    Test2Dao test2Dao;

    @Autowired
    DataSourceTransactionManager transactionManager;
    @Autowired
    TransactionDefinition transactionDefinition;

    /**
     * 主方法
     */
    public void main(){
        //保存数据库system2表Test2
        saveTest2();
        //手动开启事务
        TransactionStatus transactionStatus = transactionManager.getTransaction(transactionDefinition);
        try{
            //保存数据库system1表Test1
            Test1 test1 = new Test1();
            test1.setId(0);
            test1.setName("test1");
            test1.setCreateTime(LocalDateTime.now());
            test1.setCreateUser("admin");
            test1.setModifyTime(LocalDateTime.now());
            test1.setModifyUser("admin");
            test1.setDelTime(LocalDateTime.now());
            test1.setDelUser("");
            test1.setIsdel(0);
            test1Dao.save(test1);
            //事务提交
            transactionManager.commit(transactionStatus);
        }catch (Exception ex){
            //事务回滚
            transactionManager.rollback(transactionStatus);
        }
    }

    /**
     * 保存数据库system2表Test2
     */
    void saveTest2(){
        Test2 test2 = new Test2();
        test2.setId(0);
        test2.setName("test2");
        test2.setCreateTime(LocalDateTime.now());
        test2.setCreateUser("admin");
        test2.setModifyTime(LocalDateTime.now());
        test2.setModifyUser("admin");
        test2.setDelTime(LocalDateTime.now());
        test2.setDelUser("");
        test2.setIsdel(0);
        test2Dao.save(test2);
    }
}
```
* 无论另一个数据库的操作是查询还是数据变更，多数据源使用事务都会对其有影响，因为Spring托管的事务只会维护同一个数据库链接；
* 所有的Dao层在代码生成的时候已添加对应库的DS注解，但使用事务Transactional<u>建议带上DS注解或者使用DSTransactional合并注解</u>标明对应的数据源，否则事务无法判断当前属于哪个数据源；
* 当存在两个数据库的外部调用并<u>没有数据一致性要求</u>时，推荐另一个数据库重新设置Transactional属性<u>propagation</u>为NOT_SUPPORTED或REQUIRES_NEW来控制事务传播：
    - NOT_SUPPORTED 挂起当前事务，以非事务方式进行，所以也<u>可以无需使用DS</u>标记数据源；
    - REQUIRES_NEW 新建事务，如果当前存在事务，把当前事务挂起；
* 当存在两个数据库的内部调用并<u>没有数据一致性要求</u>时，推荐使用<u>Java多线程</u>阻断事务的传播；
* 无论外部调用还是内部调用都可以采用<u>Java多线程</u>的方式来阻断事务的传播；
* 当存在两个数据库操作需要<u>一致性要求</u>时，只能通过集成<u>Seata</u>解决；
* <u>手动调用事务</u>可以自行管理事务的作用域，解决切换失效问题；

## 3. 事务失效
* 如果声明事务的方法不是<u>public</u>，事务会失效；
* 当一个没有事务的方法，调用一个有事务的方法时，事务失效；
* 异常被<u>try catch捕获</u>，事务失效；
* 数据库引擎要支持事务，mysql数据库，必须设置数据库引擎为InnoDB；
* Spring Boot是否开始事务管理，@EnableTransactionManagement（默认开启）；
* 在Transactional注解失效的情况下，以上场景也不能解决可以考虑手动处理事务的提交；
* 大部分失效问题也与动态代理失效有关，以上场景之外的可查阅动态代理相关资料；

## 4. 多数据源切换失效
* 参考官方数据源切换失败解决方案，由于架构设计上有所不同，只会出现列举的点，更多官方回答请看： https://dynamic-datasource.com/guide/faq/Failed-Switch-Database.html；
* 开启了<u>spring的事务</u>。原因： spring开启事务后会维护一个ConnectionHolder，保证在整个事务下，都是用同一个数据库连接；
* <u>shiroAop代理</u>。在shiro框架中(UserRealm)使用@Autowire 注入的类, 缓存注解和事务注解都失效，推荐@Autowire+@Lazy注解,设置注入到Shiro框架的Bean延时加载；
``` java
@Component
public class UserRealm extends AuthorizingRealm {

    @Lazy
    @Autowired
    private IUserService userService;
	//... 省略其他无关的内容
}
```
* 在DS注解失效的情况下，以上场景也不能解决可以考虑手动切换数据源，例如MapperAspect调用DynamicDataSourceContextHolder自定义操作数据源切换；
* 当切换数据源的方法并未调用数据库操作而是返回对象，再通过对象去操作数据库方法这时候也会导致数据源切换失败，例如Dao层的getMapper方法Dao层的DS注解并不会生效，只能通过重写一个代理MapperAspect自行控制数据切换，这个也是动态代理失效的问题，大部分失效问题也与动态代理失效有关，可查阅相关资料进行解决；

## 5. 异步调用的使用
 * 可通过<u>Spring Boot @Async注解</u>或使用<u>Java多线程</u>实现请求异步调用，@Async底层为Spring Boot托管线程池，从资源管理上相对优于自行开辟线程；
 * 存在较为复杂的业务场景推荐使用Java线程，例如异步调用返回或多线程并行操作，简单的请求异步调用使用Spring Boot @Async注解也行；
## 6. 批量操作数据的使用
 * 默认Dao层中已集成Mybatis Plus的saveBatch等Batch批量操作方法，底层采用<u>Mybatis批处理</u>，基本满足大部分业务，也可以控制每次批处理的数量；
 * 如果对性能上有更高的要求推荐采用Mybatis Xml模式编写批量SQL的模式，更接近SQL原生，但需要自行控制每次提交批量提交SQL的长度，超出长度将抛出数据库SQL长度限制的异常，例如Mybatis Plus中Mapper层选装件insertBatchSomeColumn，已集成到Dao层中，可以通过getMapper方法调用；