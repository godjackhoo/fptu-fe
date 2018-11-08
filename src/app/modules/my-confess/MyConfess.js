import React, { Component } from "react";
import "./MyConfess.scss";

import moment from "moment";

import { Layout, List, Button, Skeleton, Tag, Row, Alert } from "antd";
import { get, post } from "../../utils/ApiCaller";
import {
    GUEST__GET_MY_CONFESS,
    GUEST__GET_OVERVIEW,
} from "../../utils/ApiEndpoint";
import LocalStorageUtils from "../../utils/LocalStorage";
import { config } from "../../../config";

const { Content } = Layout;

const stepLoad = 10;

class MyConfess extends Component {
    state = {
        numLoad: stepLoad,
        initLoading: true,
        loading: false,
        data: [],
        list: [],
        overview: {},
    };

    componentDidMount() {
        const { numLoad } = this.state;

        this.getData(numLoad, data => {
            this.setState({
                initLoading: false,
                data,
                list: data,
            });
        });

        this.getOverview(data => {
            this.setState({
                overview: data,
            });
        });
    }

    getData = async (numLoad, callback) => {
        await setTimeout(() => {
            post(GUEST__GET_MY_CONFESS + "/" + numLoad, {
                token: LocalStorageUtils.getSenderToken(),
            }).then(res => {
                callback(res.data);
            });
        }, 1000);
    };

    getOverview = callback => {
        get(GUEST__GET_OVERVIEW).then(res => {
            callback(res.data);
        });
    };

    onLoadMore = () => {
        const { numLoad, data } = this.state;

        this.setState({
            loading: true,
            list: data.concat(
                [...new Array(stepLoad)].map(() => ({ loading: true }))
            ),
        });
        this.getData(numLoad + stepLoad, data => {
            this.setState(
                {
                    data,
                    list: data,
                    loading: false,
                    numLoad: numLoad + stepLoad,
                },
                () => {
                    // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
                    // In real scene, you can using public method of react-virtualized:
                    // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
                    window.dispatchEvent(new Event("resize"));
                }
            );
        });
    };

    getNameFromEmail(email) {
        return email.substring(0, email.lastIndexOf("@"));
    }

    pendingConfess = content => (
        <div>
            <div className="confess-content">{content}</div>
            <div style={{ margin: ".5rem 0" }}>
                <Tag color="pink">#đang_đợi_duyệt</Tag>
            </div>
        </div>
    );

    approvedConfess = (content, approver = "admin@fptu.cf", cfsid = "0") => (
        <div>
            <div className="confess-content">{content}</div>
            <div style={{ margin: ".5rem 0" }}>
                <Tag color="green">
                    <a
                        href={`https://www.facebook.com/hashtag/${
                            config.meta.fb_tagname
                        }_${cfsid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        #{config.meta.fb_tagname}
                        {cfsid}
                    </a>
                </Tag>
                <Tag color="blue">#{this.getNameFromEmail(approver)}</Tag>
            </div>
        </div>
    );

    rejectedConfess = (content, approver = "admin@fptu.cf", reason) => (
        <div>
            <div className="confess-content">
                <strike>{content}</strike>
            </div>
            <div style={{ margin: ".5rem 0" }}>
                <Tag color="red">#{this.getNameFromEmail(approver)}</Tag>
            </div>
            <div style={{ margin: ".5rem 0" }}>
                <strong>
                    Lí do bị {this.getNameFromEmail(approver)} từ chối:{" "}
                </strong>{" "}
                {reason || "Hem có"}
            </div>
        </div>
    );

    render() {
        const { initLoading, loading, list, overview } = this.state;
        const loadMore =
            !initLoading && !loading ? (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 12,
                        height: 32,
                        lineHeight: "32px",
                    }}
                >
                    <Button onClick={this.onLoadMore}>
                        cho xem thêm vài cài nữa đê
                    </Button>
                </div>
            ) : null;

        return (
            <Content className="content-container">
                <div
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        minHeight: 540,
                    }}
                >
                    <h2>Danh sách confession tui đã gửi</h2>
                    <Row style={{ marginBottom: "10px" }}>
                        Sender Token của tui là:{" "}
                        <Tag color="cyan">
                            {LocalStorageUtils.getSenderToken()}
                        </Tag>
                    </Row>

                    <Row style={{ marginBottom: "10px" }}>
                        <Alert
                            message="Thống kê tổng quan"
                            description={
                                <div>
                                    <Row>
                                        Lời nhắn đã nhận:{" "}
                                        <strong>{overview.total || "0"}</strong>{" "}
                                        cái
                                    </Row>
                                    <Row>
                                        Đang chờ duyệt:{" "}
                                        <strong>
                                            {overview.pending || "0"}
                                        </strong>{" "}
                                        cái
                                    </Row>
                                    <Row>
                                        Đã bị từ chối:{" "}
                                        <strong>
                                            {overview.rejected || "0"}
                                        </strong>{" "}
                                        cái (tỉ lệ:{" "}
                                        {Math.round(
                                            (overview.rejected /
                                                overview.total) *
                                                100
                                        ) || 0}
                                        %)
                                    </Row>
                                </div>
                            }
                            type="info"
                            showIcon
                        />
                    </Row>

                    <List
                        size="large"
                        loading={initLoading}
                        itemLayout="vertical"
                        loadMore={loadMore}
                        dataSource={list}
                        locale={{ emptyText: "Không có dữ liệu" }}
                        renderItem={(item, index) => (
                            <List.Item key={index}>
                                <Skeleton title loading={item.loading} active>
                                    <List.Item.Meta
                                        description={moment(
                                            item.createdAt
                                        ).format("HH:mm DD/MM/YYYY")}
                                    />
                                    {(item.status === null ||
                                        item.status === 0) &&
                                        this.pendingConfess(item.content)}
                                    {item.status === 1 &&
                                        this.approvedConfess(
                                            item.content,
                                            item.approver,
                                            item.cfsid
                                        )}
                                    {item.status === 2 &&
                                        this.rejectedConfess(
                                            item.content,
                                            item.approver,
                                            item.reason
                                        )}
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </div>
            </Content>
        );
    }
}

export default MyConfess;
