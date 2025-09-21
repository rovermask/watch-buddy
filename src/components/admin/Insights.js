// src/components/admin/Dashboard.js
import PieChart from "./charts/PieChart";
import BarChart from "./charts/BarChart";
import { Row, Col, Card } from "react-bootstrap";
import { useOutletContext } from "react-router-dom";

export default function AdminDashboard() {
    const { users, movies = [], books = [], series = [] } = useOutletContext();
    return (
        <div>
            {/* Top cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h5>👤 Users</h5>
                        <h3>{users.length}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h5>🎬 Movies</h5>
                        <h3>{movies.length}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h5>📚 Books</h5>
                        <h3>{books.length}</h3>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="p-3 text-center shadow-sm">
                        <h5>📺 Series</h5>
                        <h3>{series.length}</h3>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="p-3 shadow-sm">
                        <h5>Entries Distribution</h5>
                        <PieChart
                            data={[
                                { name: "Movies", value: movies.length },
                                { name: "Books", value: books.length },
                                { name: "Series", value: series.length },
                            ]}
                        />
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="p-3 shadow-sm">
                        <h5>Entries per User</h5>
                        <BarChart users={users} movies={movies} books={books} series={series} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
