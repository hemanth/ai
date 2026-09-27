(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[931], {
    9293: function(e, s, t) {
        Promise.resolve().then(t.bind(t, 9664))
    },
    9664: function(e, s, t) {
        "use strict";
        t.d(s, {
            ProductForm: function() {
                return I
            }
        });
        var a = t(7437)
          , r = t(2265)
          , n = t(5293)
          , i = t(535)
          , o = t(1994)
          , l = t(3335);
        function c() {
            for (var e = arguments.length, s = Array(e), t = 0; t < e; t++)
                s[t] = arguments[t];
            return (0,
            l.m6)((0,
            o.W)(s))
        }
        let d = (0,
        i.j)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
            variants: {
                variant: {
                    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                    ghost: "hover:bg-accent hover:text-accent-foreground",
                    link: "text-primary underline-offset-4 hover:underline"
                },
                size: {
                    default: "h-9 px-4 py-2",
                    sm: "h-8 rounded-md px-3 text-xs",
                    lg: "h-10 rounded-md px-8",
                    icon: "h-9 w-9"
                }
            },
            defaultVariants: {
                variant: "default",
                size: "default"
            }
        })
          , u = r.forwardRef( (e, s) => {
            let {className: t, variant: r, size: i, asChild: o=!1, ...l} = e
              , u = o ? n.g7 : "button";
            return (0,
            a.jsx)(u, {
                className: c(d({
                    variant: r,
                    size: i,
                    className: t
                })),
                ref: s,
                ...l
            })
        }
        );
        u.displayName = "Button";
        let m = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("textarea", {
                className: c("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", t),
                ref: s,
                ...r
            })
        }
        );
        m.displayName = "Textarea";
        let p = r.forwardRef( (e, s) => {
            let {className: t, type: r, ...n} = e;
            return (0,
            a.jsx)("input", {
                type: r,
                className: c("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", t),
                ref: s,
                ...n
            })
        }
        );
        p.displayName = "Input";
        var h = t(1107);
        let x = (0,
        i.j)("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70")
          , g = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)(h.f, {
                ref: s,
                className: c(x(), t),
                ...r
            })
        }
        );
        g.displayName = h.f.displayName;
        let f = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("rounded-xl border bg-card text-card-foreground shadow", t),
                ...r
            })
        }
        );
        f.displayName = "Card";
        let b = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("flex flex-col space-y-1.5 p-6", t),
                ...r
            })
        }
        );
        b.displayName = "CardHeader";
        let y = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("font-semibold leading-none tracking-tight", t),
                ...r
            })
        }
        );
        y.displayName = "CardTitle";
        let v = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("text-sm text-muted-foreground", t),
                ...r
            })
        }
        );
        v.displayName = "CardDescription";
        let w = r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("p-6 pt-0", t),
                ...r
            })
        }
        );
        w.displayName = "CardContent",
        r.forwardRef( (e, s) => {
            let {className: t, ...r} = e;
            return (0,
            a.jsx)("div", {
                ref: s,
                className: c("flex items-center p-6 pt-0", t),
                ...r
            })
        }
        ).displayName = "CardFooter";
        var j = t(1658);
        let N = (0,
        t(9024).J)({
            baseURL: "https://api.groq.com/openai/v1",
            apiKey: ["gsk_","oWD8jf1mpYow2L2XqhBtWGdyb3FYS6GYUaDMnH1eK7UUVox3yLbu"].join("")
        });
        async function k(e, s, t, a) {
            let r = "Create a comprehensive Product Requirements Document (PRD) for the following product. Be specific, actionable, and focus on measurable outcomes.\n\nProduct Name: ".concat(e, "\nProduct Description: ").concat(s, "\nTarget Audience: ").concat(t, "\nBusiness Goals: ").concat(a, "\n\nStructure the PRD with these sections:\n\n1. Overview\n- High-level product vision\n- Key differentiators\n- Strategic alignment\n\n2. Problem Statement\n- Current pain points\n- Market gaps\n- User challenges to solve\n\n3. Goals and Objectives\n- Primary product goals\n- Key performance indicators (KPIs)\n- Target outcomes\n\n4. Features and Requirements\n- Core functionality\n- Technical requirements\n- User experience requirements\n- Integration needs\n- Security and compliance needs\n\n5. Success Metrics\n- User adoption metrics\n- Business metrics\n- Technical performance metrics\n- Quality benchmarks\n\n6. Timeline and Milestones\n- Development phases\n- Key deliverables\n- Resource requirements\n- Risk mitigation plans\n\nFormat the response in clean Markdown with clear headings, bullet points, and sections. Focus on clarity and actionability.");
            return (await (0,
            j._4)({
                model: N("llama-3.3-70b-versatile"),
                messages: [{
                    role: "user",
                    content: r
                }]
            })).text
        }
        async function C(e) {
            return (await (0,
            j._4)({
                model: N("llama-3.3-70b-versatile"),
                messages: [{
                    role: "user",
                    content: "Based on the following PRD, generate a list of Epics (high-level user stories that represent major features or capabilities). Each Epic should be substantial enough to break down into multiple smaller user stories, but focused on a specific area of functionality.\n\n".concat(e, '\n\nGenerate 4-6 Epics that together cover the core product capabilities. For each Epic:\n\n1. Give it a clear, descriptive title prefixed with "# Epic: "\n2. Write a brief overview explaining the high-level goal and value proposition\n3. List the key capabilities and requirements that fall under this Epic\n4. Note any major dependencies or technical considerations\n5. Indicate the expected user impact and business value\n\nFormat in clean markdown with proper headings and bullet points. Ensure Epics are:\n- Independent of each other where possible\n- Sized appropriately (not too broad or narrow)\n- Aligned with the PRD\'s goals and requirements\n- Clear enough for engineers to understand the scope')
                }]
            })).text
        }
        async function E(e) {
            return (await (0,
            j._4)({
                model: N("llama-3.3-70b-versatile"),
                messages: [{
                    role: "user",
                    content: 'Break down the following Epic into detailed user stories. For each story:\n\n1. Use the format: "As a [type of user], I want [goal] so that [benefit]"\n2. Include acceptance criteria with 3-4 specific conditions that must be met\n3. Add notes on any technical considerations or dependencies\n4. Estimate relative complexity (Low/Medium/High)\n\nEpic:\n'.concat(e, "\n\nGenerate 4-6 user stories that together would deliver the epic's functionality. Ensure the stories:\n- Are independent and can be worked on separately\n- Cover both happy path and edge cases\n- Are specific and testable\n- Include all key user roles/personas\n- Follow a logical progression\n\nFormat in clean markdown with proper headings and spacing.")
                }]
            })).text
        }
        var D = t(3459)
          , R = t(1230)
          , S = t(7677)
          , P = t(6904)
          , G = t(2296)
          , A = t(5465)
          , F = t(9559)
          , q = t(659);
        function z(e) {
            let {content: s, onEpicClick: t, onEdit: n} = e
              , [i,o] = (0,
            r.useState)(!1)
              , [l,c] = (0,
            r.useState)(s)
              , [d,p] = (0,
            r.useState)(!1)
              , h = async () => {
                await navigator.clipboard.writeText(s),
                p(!0),
                setTimeout( () => p(!1), 2e3)
            }
              , x = () => {
                null == n || n(l),
                o(!1)
            }
            ;
            return (0,
            a.jsxs)(f, {
                className: "relative p-6",
                children: [(0,
                a.jsxs)("div", {
                    className: "absolute right-4 top-4 flex gap-2",
                    children: [n && (0,
                    a.jsx)(u, {
                        variant: "outline",
                        size: "icon",
                        onClick: () => i ? x() : o(!0),
                        children: i ? (0,
                        a.jsx)(A.Z, {
                            className: "h-4 w-4"
                        }) : (0,
                        a.jsx)(S.Z, {
                            className: "h-4 w-4"
                        })
                    }), (0,
                    a.jsx)(u, {
                        variant: "outline",
                        size: "icon",
                        onClick: h,
                        children: d ? (0,
                        a.jsx)(F.Z, {
                            className: "h-4 w-4"
                        }) : (0,
                        a.jsx)(q.Z, {
                            className: "h-4 w-4"
                        })
                    })]
                }), (0,
                a.jsx)("div", {
                    className: "pr-24",
                    children: i ? (0,
                    a.jsx)(m, {
                        value: l,
                        onChange: e => c(e.target.value),
                        className: "min-h-[300px] font-mono text-sm"
                    }) : (0,
                    a.jsx)(G.U, {
                        components: {
                            h1: e => {
                                let {children: r} = e;
                                return (0,
                                a.jsxs)("div", {
                                    className: "flex items-center justify-between mb-4",
                                    children: [(0,
                                    a.jsx)("h1", {
                                        className: "text-2xl font-bold",
                                        children: r
                                    }), t && (0,
                                    a.jsx)(u, {
                                        onClick: () => t(s),
                                        children: "Generate Stories"
                                    })]
                                })
                            }
                            ,
                            h2: e => {
                                let {children: s} = e;
                                return (0,
                                a.jsx)("h2", {
                                    className: "text-xl font-semibold mt-6 mb-4",
                                    children: s
                                })
                            }
                            ,
                            p: e => {
                                let {children: s} = e;
                                return (0,
                                a.jsx)("p", {
                                    className: "mb-4 whitespace-pre-wrap",
                                    children: s
                                })
                            }
                            ,
                            ul: e => {
                                let {children: s} = e;
                                return (0,
                                a.jsx)("ul", {
                                    className: "list-disc pl-6 mb-4",
                                    children: s
                                })
                            }
                            ,
                            ol: e => {
                                let {children: s} = e;
                                return (0,
                                a.jsx)("ol", {
                                    className: "list-decimal pl-6 mb-4",
                                    children: s
                                })
                            }
                        },
                        children: s
                    })
                })]
            })
        }
        let Z = [{
            id: "input",
            name: "Product Details"
        }, {
            id: "prd",
            name: "PRD"
        }, {
            id: "epics",
            name: "Epics"
        }, {
            id: "stories",
            name: "Stories"
        }];
        function _(e) {
            let {currentStep: s, onStepClick: t, hasContent: r} = e;
            return (0,
            a.jsx)("nav", {
                "aria-label": "Progress",
                children: (0,
                a.jsx)("ol", {
                    className: "grid grid-cols-2 gap-2 sm:flex sm:space-x-4",
                    children: Z.map(e => {
                        let n = s === e.id
                          , i = "input" === e.id || r[e.id];
                        return (0,
                        a.jsx)("li", {
                            className: "sm:flex-1",
                            children: (0,
                            a.jsx)("button", {
                                onClick: () => i && t(e.id),
                                className: "\n                  w-full px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md\n                  ".concat(i ? "cursor-pointer" : "cursor-not-allowed opacity-50", "\n                  ").concat(n ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" : i ? "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", "\n                "),
                                disabled: !i,
                                children: e.name
                            })
                        }, e.name)
                    }
                    )
                })
            })
        }
        let T = {
            productName: "TaskFlow Pro",
            productDescription: "A smart task management application designed for remote teams. It uses AI to automatically prioritize tasks, suggest optimal task distribution among team members, and provide insights into team productivity patterns.",
            targetAudience: "Remote-first companies and distributed teams of 10-500 people, particularly in tech, consulting, and creative industries. Primary users include project managers, team leads, and individual contributors who need to collaborate effectively across different time zones.",
            businessGoals: "1. Achieve 10,000 active users within the first 6 months\n2. Maintain a user retention rate of 80% after 3 months\n3. Generate $500,000 in annual recurring revenue through subscription model\n4. Establish partnerships with 5 major remote-work platforms"
        };
        function I() {
            let[e,s] = (0,
            r.useState)(T)
              , [t,n] = (0,
            r.useState)("")
              , [i,o] = (0,
            r.useState)("")
              , [l,c] = (0,
            r.useState)("")
              , [d,h] = (0,
            r.useState)(!1)
              , [x,j] = (0,
            r.useState)("input");
            async function N(s) {
                s.preventDefault(),
                h(!0);
                try {
                    let s = await k(e.productName, e.productDescription, e.targetAudience, e.businessGoals);
                    n(s),
                    j("prd")
                } catch (e) {
                    console.error(e)
                } finally {
                    h(!1)
                }
            }
            async function G() {
                h(!0);
                try {
                    let e = await C(t);
                    o(e),
                    j("epics")
                } catch (e) {
                    console.error(e)
                } finally {
                    h(!1)
                }
            }
            async function A(e) {
                h(!0);
                try {
                    let s = await E(e);
                    c(s),
                    j("stories")
                } catch (e) {
                    console.error(e)
                } finally {
                    h(!1)
                }
            }
            let F = e => {
                let {name: t, value: a} = e.target;
                s(e => ({
                    ...e,
                    [t]: a
                }))
            }
            ;
            return (0,
            a.jsxs)("div", {
                className: "space-y-4 sm:space-y-8",
                children: [(0,
                a.jsx)(_, {
                    currentStep: x,
                    onStepClick: e => {
                        ("prd" !== e || t) && ("epics" !== e || i) && ("stories" !== e || l) && j(e)
                    }
                    ,
                    hasContent: {
                        prd: !!t,
                        epics: !!i,
                        stories: !!l
                    }
                }), "input" === x && (0,
                a.jsxs)(f, {
                    className: "transition-all hover:shadow-lg w-full overflow-hidden",
                    children: [(0,
                    a.jsxs)(b, {
                        className: "p-4 sm:p-6",
                        children: [(0,
                        a.jsx)(y, {
                            className: "text-xl sm:text-2xl",
                            children: "Product Details"
                        }), (0,
                        a.jsx)(v, {
                            className: "text-sm sm:text-base",
                            children: "Start by providing basic information about your product"
                        })]
                    }), (0,
                    a.jsx)(w, {
                        className: "p-4 sm:p-6 overflow-x-auto",
                        children: (0,
                        a.jsxs)("form", {
                            id: "product-form",
                            onSubmit: N,
                            className: "space-y-4",
                            children: [(0,
                            a.jsxs)("div", {
                                className: "space-y-2",
                                children: [(0,
                                a.jsx)(g, {
                                    htmlFor: "productName",
                                    children: "Product Name"
                                }), (0,
                                a.jsx)(p, {
                                    id: "productName",
                                    name: "productName",
                                    value: e.productName,
                                    onChange: F,
                                    placeholder: "Enter the product name",
                                    required: !0
                                })]
                            }), (0,
                            a.jsxs)("div", {
                                className: "space-y-2",
                                children: [(0,
                                a.jsx)(g, {
                                    htmlFor: "productDescription",
                                    children: "Product Description"
                                }), (0,
                                a.jsx)(m, {
                                    id: "productDescription",
                                    name: "productDescription",
                                    value: e.productDescription,
                                    onChange: F,
                                    placeholder: "Describe your product and its main features",
                                    required: !0
                                })]
                            }), (0,
                            a.jsxs)("div", {
                                className: "space-y-2",
                                children: [(0,
                                a.jsx)(g, {
                                    htmlFor: "targetAudience",
                                    children: "Target Audience"
                                }), (0,
                                a.jsx)(m, {
                                    id: "targetAudience",
                                    name: "targetAudience",
                                    value: e.targetAudience,
                                    onChange: F,
                                    placeholder: "Who is this product for?",
                                    required: !0
                                })]
                            }), (0,
                            a.jsxs)("div", {
                                className: "space-y-2",
                                children: [(0,
                                a.jsx)(g, {
                                    htmlFor: "businessGoals",
                                    children: "Business Goals"
                                }), (0,
                                a.jsx)(m, {
                                    id: "businessGoals",
                                    name: "businessGoals",
                                    value: e.businessGoals,
                                    onChange: F,
                                    placeholder: "What are the business objectives?",
                                    required: !0
                                })]
                            })]
                        })
                    }), (0,
                    a.jsx)("div", {
                        className: "flex justify-end px-6 py-4 border-t",
                        children: (0,
                        a.jsxs)(u, {
                            type: "submit",
                            form: "product-form",
                            disabled: d,
                            className: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
                            children: [d && (0,
                            a.jsx)(D.Z, {
                                className: "mr-2 h-4 w-4 animate-spin"
                            }), "Generate PRD", (0,
                            a.jsx)(R.Z, {
                                className: "ml-2 h-4 w-4"
                            })]
                        })
                    })]
                }), "prd" === x && (0,
                a.jsxs)(f, {
                    className: "transition-all hover:shadow-lg w-full overflow-hidden",
                    children: [(0,
                    a.jsxs)(b, {
                        className: "p-4 sm:p-6",
                        children: [(0,
                        a.jsx)(y, {
                            className: "text-xl sm:text-2xl font-display",
                            children: "Product Requirements Document"
                        }), (0,
                        a.jsxs)("div", {
                            className: "flex flex-wrap gap-2",
                            children: [(0,
                            a.jsxs)(u, {
                                variant: "outline",
                                size: "sm",
                                onClick: () => j("input"),
                                children: [(0,
                                a.jsx)(S.Z, {
                                    className: "mr-2 h-4 w-4"
                                }), "Edit Details"]
                            }), (0,
                            a.jsxs)(u, {
                                size: "sm",
                                onClick: async () => {
                                    h(!0);
                                    try {
                                        let s = await k(e.productName, e.productDescription, e.targetAudience, e.businessGoals);
                                        n(s)
                                    } catch (e) {
                                        console.error(e)
                                    } finally {
                                        h(!1)
                                    }
                                }
                                ,
                                disabled: d,
                                className: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
                                children: [(0,
                                a.jsx)(P.Z, {
                                    className: "mr-2 h-4 w-4"
                                }), "Regenerate PRD"]
                            }), (0,
                            a.jsxs)(u, {
                                size: "sm",
                                onClick: G,
                                disabled: d,
                                className: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
                                children: [d && (0,
                                a.jsx)(D.Z, {
                                    className: "mr-2 h-4 w-4 animate-spin"
                                }), "Generate Epics", (0,
                                a.jsx)(P.Z, {
                                    className: "ml-2 h-4 w-4"
                                })]
                            })]
                        })]
                    }), (0,
                    a.jsx)(w, {
                        className: "p-4 sm:p-6 overflow-x-auto",
                        children: (0,
                        a.jsx)(z, {
                            content: t,
                            onEdit: e => n(e)
                        })
                    })]
                }), "epics" === x && (0,
                a.jsxs)(f, {
                    className: "transition-all hover:shadow-lg w-full overflow-hidden",
                    children: [(0,
                    a.jsxs)(b, {
                        className: "p-4 sm:p-6",
                        children: [(0,
                        a.jsx)(y, {
                            className: "text-xl sm:text-2xl font-display",
                            children: "Epics"
                        }), (0,
                        a.jsxs)("div", {
                            className: "flex flex-wrap gap-2",
                            children: [(0,
                            a.jsxs)(u, {
                                variant: "outline",
                                size: "sm",
                                onClick: async () => {
                                    h(!0);
                                    try {
                                        let e = await C(t);
                                        o(e)
                                    } catch (e) {
                                        console.error(e)
                                    } finally {
                                        h(!1)
                                    }
                                }
                                ,
                                disabled: d,
                                children: [(0,
                                a.jsx)(P.Z, {
                                    className: "mr-2 h-4 w-4"
                                }), "Regenerate Epics"]
                            }), (0,
                            a.jsxs)(u, {
                                size: "sm",
                                onClick: () => A(i),
                                disabled: d,
                                className: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200",
                                children: [d && (0,
                                a.jsx)(D.Z, {
                                    className: "mr-2 h-4 w-4 animate-spin"
                                }), "Generate Stories", (0,
                                a.jsx)(P.Z, {
                                    className: "ml-2 h-4 w-4"
                                })]
                            })]
                        })]
                    }), (0,
                    a.jsx)(w, {
                        className: "p-4 sm:p-6 overflow-x-auto",
                        children: (0,
                        a.jsx)(z, {
                            content: i,
                            onEpicClick: A,
                            onEdit: e => o(e)
                        })
                    })]
                }), "stories" === x && (0,
                a.jsxs)(f, {
                    className: "transition-all hover:shadow-lg w-full overflow-hidden",
                    children: [(0,
                    a.jsxs)(b, {
                        className: "p-4 sm:p-6",
                        children: [(0,
                        a.jsx)(y, {
                            className: "text-xl sm:text-2xl font-display",
                            children: "User Stories"
                        }), (0,
                        a.jsxs)(u, {
                            variant: "outline",
                            size: "sm",
                            onClick: () => j("epics"),
                            children: [(0,
                            a.jsx)(R.Z, {
                                className: "mr-2 h-4 w-4"
                            }), "Back to Epics"]
                        })]
                    }), (0,
                    a.jsx)(w, {
                        className: "p-4 sm:p-6 overflow-x-auto",
                        children: (0,
                        a.jsx)(z, {
                            content: l,
                            onEdit: e => c(e)
                        })
                    })]
                })]
            })
        }
    }
}, function(e) {
    e.O(0, [989, 547, 971, 117, 744], function() {
        return e(e.s = 9293)
    }),
    _N_E = e.O()
}
]);
