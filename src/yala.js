import React, { useState } from "react";
import { Card, Collapse, Progress, Alert, Button, Radio, message, Form, Checkbox, Input,Modal, Typography } from "antd";
import { SmileOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Paragraph } = Typography;
const { TextArea } = Input;
const Yala = () => {
    const [visible, setVisible] = useState(false);

    const showModal = () => {
        setVisible(true);
    };

    const hideModal = () => {
        setVisible(false);
    };

    const [form] = Form.useForm();

    const handleSubmit = (values) => {
      console.log("Submitted values:", values);
      message.success("Thank you for your feedback!");
      form.resetFields();
    };
    return (
        <div style={{ margin: "20px" }}>
            <Card title="孤岛惊魂6的结局介绍" bordered={false}>
                <Collapse accordion>
                    <Panel header="隐藏结局" key="1">
                        <Paragraph>
                            如果你在游戏的开始阶段，选择离开亚拉，你就可以解锁隐藏结局。你只需要驾驶船只向地图的边缘航行，直到出现“离开亚拉”的提示，然后继续前进。
                        </Paragraph>
                        <Paragraph>
                            屏幕会变黑，然后显示三个月后的场景，丹妮·罗哈斯躺在迈阿密的沙滩上，收音机里播报着安东·卡斯蒂略消灭了反抗军并杀死了克拉拉·加西亚。
                        </Paragraph>
                        <Progress percent={100} status="success" />
                        <Alert message="你已经完成了游戏，但是你是否真的满意呢？" type="warning" showIcon />
                    </Panel>
                    <Panel header="留下来战斗的结局" key="2">
                        <Paragraph>
                            如果你选择留下来战斗，你就会继续游戏的主线剧情，直到最后面对安东·卡斯蒂略和他的儿子迪亚哥。
                        </Paragraph>
                        <Paragraph>
                            你会和反抗军一起攻占首都埃斯佩兰萨，并且在总统府前与安东·卡斯蒂略对峙。安东·卡斯蒂略会告诉你，他患有癌症，无法用维维罗治疗，他的目的是让迪亚哥继承他的遗志，建立一个强大的亚拉。他会说，他不会让你或者任何人活捉他或者迪亚哥，然后他会开枪打中迪亚哥的胸口，再用刀割开自己的喉咙，结束自己的生命。
                        </Paragraph>
                        <Paragraph>
                            你会看到迪亚哥还有一口气，你可以选择是救他还是杀了他。如果你救他，他会说他不想成为总统，他只想离开亚拉。如果你杀了他，他会说他恨你，然后死去。
                        </Paragraph>
                        <Paragraph>
                            之后，你会和另一位反抗军领袖叶莲娜·莫拉莱斯谈话，她会说你应该成为新的总统，因为你是自由的象征。你可以选择是接受还是拒绝。如果你接受，你会成为亚拉的新领导人，但是你会感到不安和压力。如果你拒绝，你会让叶莲娜成为总统，而你会继续作为自由战士的领袖。
                        </Paragraph>
                        <Paragraph>
                            无论你做出什么选择，你都会看到一个回顾的视频，展示了你在游戏中的一些经历和决定，以及你的同伴们对你的评价。视频的最后，你会听到胡安·科尔特斯的声音，他会说他有一个新的计划，需要你的帮助。
                        </Paragraph>
                        <Progress percent={50} status="active" />
                        
                        <Alert message="你还没有完成游戏，你是否想要继续呢？" type="info" />
                    </Panel>
                </Collapse>
                <Button type="primary" onClick={showModal} icon={<SmileOutlined/>} style={{marginTop:10}}>
                    查看更多
                </Button>
                <Modal title="更多信息" visible={visible} onOk={hideModal} onCancel={hideModal}>
                    <Paragraph>
                        彩蛋来啦
                        🎉🎉🎉恭喜你，发现了彩蛋！🎉🎉🎉
                    </Paragraph>
                </Modal>
            </Card>
            <Card title="孤岛惊魂5和6的对比" bordered={false} style={{marginTop:10}}>
                <Collapse accordion>
                    <Panel header="故事" key="1">
                        <Paragraph>
                            孤岛惊魂5和6的故事都涉及到反抗和起义的主题，但是以不同的方式呈现。孤岛惊魂5的故事并不太严肃，而是注重游戏性，它涉及到核战争，宗教启示，幻觉序列等更多离奇的元素。孤岛惊魂6的故事则更加接地气，即使它仍然有动作电影的气势。孤岛惊魂6的故事还展现了安东和他的儿子迪亚哥之间的有趣的关系，这是一个更加个人化的故事线。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂6的故事比孤岛惊魂5的故事更有吸引力和深度。" type="success" showIcon />
                    </Panel>
                    <Panel header="玩法" key="2">
                        <Paragraph>
                            孤岛惊魂5和6的玩法都没有太大的变化，它们都是典型的孤岛惊魂系列的游戏风格。你仍然可以占领敌人的基地，使用各种武器和装备，帮助一些古怪的角色完成他们的任务。甚至任务的结构也大致相同，你需要清理大量的敌人和完成很多的取物任务。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂5和6的玩法都很有趣和刺激，但是也需要一些创新和改进。" type="info" showIcon />
                    </Panel>
                    <Panel header="副本" key="3">
                        <Paragraph>
                            孤岛惊魂5和6的副本都是游戏的一个重要部分，它们提供了一些额外的内容和挑战。孤岛惊魂5的副本包括了“失落的在世界”（Lost on Mars），“死亡的赞美诗”（Hours of Darkness），“僵尸的生存”（Dead Living Zombies）等三个主题各异的DLC，以及一个自由创作的地图编辑器。孤岛惊魂6的副本包括了“特别行动”（Special Operations），“血龙”（Blood Dragon），“瓦斯的疯狂”（Vaas: Insanity），“帕甘的愤怒”（Pagan: Control），“约瑟夫的复仇”（Joseph: Collapse）等五个与前作有关的DLC，以及一个全新的“游击模式”（Guerrilla Mode）。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂6的副本比孤岛惊魂5的副本更有趣和丰富，它们有更多的联系和延续。" type="success" showIcon />
                    </Panel>
                    <Panel header="角色" key="4">
                        <Paragraph>
                            孤岛惊魂5和6的角色都是游戏的一个亮点，它们有各自的个性和特色。孤岛惊魂5的角色包括了约瑟夫·席德（Joseph Seed）和他的信徒，尼克·莱（Nick Rye）和他的飞机，赫克·德拉布（Hurk Drubman）和他的火箭筒，芬恩·霍勒（Fin Horatio）和他的猪等等。孤岛惊魂6的角色包括了安东·卡斯蒂略（Anton Castillo）和他的儿子迪亚哥（Diego），克拉拉·加西亚（Clara Garcia）和她的反抗军，胡安·科尔特斯（Juan Cortez）和他的武器，奇基（Chicharron）和他的鸡等等。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂5和6的角色都很有魅力和趣味，但是孤岛惊魂6的角色更加复杂和多样。" type="success" showIcon />
                    </Panel>
                    <Panel header="画面" key="5">
                        <Paragraph>
                            孤岛惊魂5和6的画面都很美丽和细致，它们展现了不同的风景和环境。孤岛惊魂5的画面以美国蒙大拿州的希望郡为背景，有着广阔的草原，高耸的山峰，清澈的河流，以及各种的动植物。孤岛惊魂6的画面以加勒比海的亚拉岛为背景，有着热带的气候，多彩的建筑，混乱的城市，以及各种的文化和风俗。孤岛惊魂6的画面还支持光线追踪和其他的高级特效，使得游戏的画面更加逼真和绚丽。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂6的画面比孤岛惊魂5的画面更加优秀和精致，它们有更多的细节和变化。" type="success" showIcon />
                    </Panel>
                    <Panel header="音乐" key="6">
                        <Paragraph>
                            孤岛惊魂5和6的音乐都很出色和动听，它们符合游戏的氛围和主题。孤岛惊魂5的音乐由丹·罗默（Dan Romer）创作，他使用了一些美国乡村音乐的元素，如吉他，口琴，小提琴等，以及一些宗教音乐的元素，如合唱，管风琴，钟声等，来表达游戏的情感和气氛。孤岛惊魂6的音乐由佩德罗·布朗奇（Pedro Bromfman）创作，他使用了一些加勒比音乐的元素，如钢鼓，吉他，小号等，以及一些革命音乐的元素，如口号，鼓声，枪声等，来表达游戏的热情和张力。
                        </Paragraph>
                        <Alert message="我认为孤岛惊魂5和6的音乐都很棒和有特色，但是孤岛惊魂6的音乐更加符合游戏的风格和气氛。" type="success" showIcon />
                    </Panel>
                </Collapse>
            </Card>
            <Card title="孤岛惊魂6的调查表单" bordered={false} style={{marginTop:10}}>
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="rating"
                        label="你对孤岛惊魂6的整体评价是什么？"
                        rules={[{ required: true, message: "请选择一个选项" }]}
                    >
                        <Radio.Group>
                            <Radio value="1">非常差</Radio>
                            <Radio value="2">差</Radio>
                            <Radio value="3">一般</Radio>
                            <Radio value="4">好</Radio>
                            <Radio value="5">非常好</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        name="aspects"
                        label="你觉得孤岛惊魂6的哪些方面做得比较好？"
                        rules={[{ required: true, message: "请至少选择一个选项" }]}
                    >
                        <Checkbox.Group>
                            <Checkbox value="story">故事</Checkbox>
                            <Checkbox value="gameplay">玩法</Checkbox>
                            <Checkbox value="dlc">副本</Checkbox>
                            <Checkbox value="characters">角色</Checkbox>
                            <Checkbox value="graphics">画面</Checkbox>
                            <Checkbox value="music">音乐</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item
                        name="suggestions"
                        label="你对孤岛惊魂6有什么建议或意见？"
                        rules={[{ required: true, message: "请输入至少10个字" }]}
                    >
                        <TextArea
                            placeholder="请输入你的建议或意见，至少10个字"
                            autoSize={{ minRows: 3, maxRows: 6 }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Yala;
