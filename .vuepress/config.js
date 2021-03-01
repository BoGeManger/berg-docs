module.exports = {
    dest: "docs",
    base: "/berg-docs/",
    markdown: {
        externalLinks: {
            target: "_blank",
            rel: "noopener noreferrer"
        }
    },
    locales: {
        "/": {
            lang: "zh-CN",
            title: "Berg",
            description: "快速构建web应用程序"
        },
        //   "/en/": {
        //   }
    },
    head: [

    ],
    themeConfig: {
        locales: {
            "/": {
                nav: [
                    {
                        text: "指南",
                        link: "/guide/"
                    },
                    {
                        text: "生态",
                        items: [
                            {
                                text: "berg-boot【Spring Boot示例项目】",
                                link: "https://gitee.com/Nyberg/berg-boot",
                            },
                            {
                                text: "berg-boot-sample【Spring Boot简单示例项目】",
                                link: "https://gitee.com/Nyberg/berg-boot-sample",
                            },
                            {
                                text: "berg-cloud【Spring Cloud示例项目】",
                                link: "https://gitee.com/Nyberg/berg-cloud",
                            },
                            {
                                text: "berg-wx-mp【微信公众号示例项目】",
                                link: "https://gitee.com/Nyberg/berg-wx-mp",
                            },
                            {
                                text: "berg-wx-miniapp【微信小程序示例项目】",
                                link: "https://gitee.com/Nyberg/berg-wx-miniapp",
                            },
                            {
                                text: "berg-wx-cp【微信企业号示例】",
                                link: "https://gitee.com/Nyberg/berg-wx-cp",
                            },
                            {
                                text: "ant-design-pro-berg【管理系统前端】",
                                link: "https://gitee.com/Nyberg/ant-design-pro-berg",
                            },
                        ],
                    },
                    {
                        text: 'GitHub',
                        link: 'https://github.com/BoGeManger/berg-boot.git'
                    }, {
                        text: 'Gitee',
                        link: 'https://gitee.com/Nyberg/berg-boot.git'
                    }
                ],
                sidebar: {
                    "/guide/": genGuideSidebar(true),
                }
            },
            // "/en/": {
            // }
        }
    },
    plugins: [
        ['@vuepress/back-to-top', true]
    ]
};

function genGuideSidebar() {
    return [
        {
            title: "简介",
            collapsable: false,
            children: [""]
        },
        {
            title: "环境搭建",
            collapsable: false,
            children: ["create/docker", "create/redis", "create/minio", "create/nginx"]
        },
        {
            title: "使用说明",
            collapsable: false,
            children: ["use/page","use/newdb","use/generator","use/error-handler"]
        },
        {
            title: "部署",
            collapsable: false,
            children: ["build/docker","build/sh"]
        },
        {
            title: "FAQ",
            collapsable: false,
            children: ["faq/problem"]
        },
        {
            title: "未完待续。。。",
            collapsable: false,
            children: []
        }
    ];
}